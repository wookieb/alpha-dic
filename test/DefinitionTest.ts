import { Definition } from "@src/Definition";
import * as sinon from "sinon";
import { TypeRef } from "@src/TypeRef";
import { Container } from "@src/Container";
import { create } from "@src/index";
import { ERRORS } from "@src/errors";
import "@pallad/errors-dev";

describe("Annotation", () => {
	const ARGS = [1, 2, 3];
	const CONTEXT = { foo: "bar" };

	let definition: Definition;

	beforeEach(() => {
		definition = new Definition("name");
	});

	it("via static create", () => {
		const def = Definition.create("name");
		expect(def.name).toEqual("name");
	});

	it("using constructor", () => {
		const spy = sinon.spy();

		class Test {
			constructor() {
				spy.apply(this, arguments as any);
			}
		}

		expect(definition.useConstructor(Test)).toStrictEqual(definition);

		expect(definition.type).toEqual(TypeRef.createFromType(Test));

		const result = definition.factory.apply(CONTEXT, ARGS);
		expect(result).toBeInstanceOf(Test);
		sinon.assert.calledWithExactly(spy, ...ARGS);
	});

	it("using class", () => {
		const spy = sinon.spy();

		class Test {
			constructor() {
				spy.apply(this, arguments as any);
			}
		}

		expect(definition.useClass(Test)).toStrictEqual(definition);
		expect(definition.type).toEqual(TypeRef.createFromType(Test));

		const result = definition.factory.apply(CONTEXT, ARGS);
		expect(result).toBeInstanceOf(Test);
		sinon.assert.calledWithExactly(spy, ...ARGS);
	});

	it("using factory", () => {
		const expectedResult = { foo: "bar" };
		const stub = sinon.stub().returns(expectedResult);

		expect(definition.useFactory(stub)).toStrictEqual(definition);

		const result = definition.factory.apply(CONTEXT, ARGS);
		expect(definition.type).toBeUndefined();

		expect(result).toStrictEqual(expectedResult);
		sinon.assert.calledOn(stub, CONTEXT);
		sinon.assert.calledWithExactly(stub, ...ARGS);
	});

	it("using factory with type", () => {
		class Foo {}

		const expectedResult = new Foo();
		const stub = sinon.stub().returns(expectedResult);

		expect(definition.useFactory(stub, Foo)).toStrictEqual(definition);

		const result = definition.factory.apply(CONTEXT, ARGS);
		expect(definition.type).toEqual(TypeRef.createFromType(Foo));

		expect(result).toStrictEqual(expectedResult);
		sinon.assert.calledOn(stub, CONTEXT);
		sinon.assert.calledWithExactly(stub, ...ARGS);
	});

	it("using value", () => {
		const expectedResult = { foo: "bar" };

		expect(definition.useValue(expectedResult)).toStrictEqual(definition);
		expect(definition.factory.apply(CONTEXT, ARGS)).toStrictEqual(expectedResult);
	});

	it("setting args", () => {
		definition.withArgs(...ARGS);
		expect(definition.args).toEqual(ARGS);
	});

	it("annotation", () => {
		const annotation = { name: "test" };

		expect(definition.annotate(annotation)).toStrictEqual(definition);
		expect(definition.annotations).toEqual([annotation]);
	});

	it("multiple annotations", () => {
		const annotation1 = { name: "test1" };
		const annotation2 = { name: "test2" };

		expect(definition.annotate(annotation1, annotation2)).toStrictEqual(definition);
		expect(definition.annotations).toEqual([annotation1, annotation2]);
	});

	it("locking makes object immutable", () => {
		const definition = Definition.create("name")
			.annotate("someAnnotation")
			.withArgs("some", "args");

		definition.lock();

		expect(Object.isFrozen(definition)).toBe(true);
		expect(Object.isFrozen(definition.args)).toBe(true);
		expect(Object.isFrozen(definition.annotations)).toBe(true);
	});

	describe("Modify", () => {
		const definition = Definition.create("someName")
			.annotate("annotation1", "annotation2")
			.withArgs("arg1", "arg2")
			.lock();

		it("modyfing name", () => {
			const name = "newName";
			const newDefinition = definition.modify({ name });

			expect(newDefinition).toEqual(
				Definition.create(name)
					.annotate(...definition.annotations)
					.withArgs(...definition.args)
			);
			expect(Object.isFrozen(newDefinition)).toBe(true);
		});

		it("modifying annotations", () => {
			const annotations = ["new", "annotations"];
			const newDefinition = definition.modify({ annotations });

			expect(newDefinition).toEqual(
				Definition.create(definition.name)
					.annotate(...annotations)
					.withArgs(...definition.args)
			);
			expect(Object.isFrozen(newDefinition)).toBe(true);
		});

		it("modifying args", () => {
			const args = ["new", "args"];
			const newDefinition = definition.modify({ args });

			expect(newDefinition).toEqual(
				Definition.create(definition.name)
					.annotate(...definition.annotations)
					.withArgs(...args)
			);
			expect(Object.isFrozen(newDefinition)).toBe(true);
		});

		it("modifying multiple things at a time", () => {
			const args = ["new", "args"];
			const annotations = ["new", "annotations"];
			const newDefinition = definition.modify({ args, annotations });

			expect(newDefinition).toEqual(
				Definition.create(definition.name)
					.annotate(...annotations)
					.withArgs(...args)
			);
			expect(Object.isFrozen(newDefinition)).toBe(true);
		});
	});

	describe("setting owner", () => {
		let container: Container;
		beforeEach(() => {
			container = create();
		});

		it("success", () => {
			const def = Definition.create().useValue("foo");

			def.setOwner(container);
			expect(def.owner).toStrictEqual(container);
		});

		it("owner cannot be set twice", () => {
			const def = Definition.create().useValue("foo");

			def.setOwner(container);

			expect(() => {
				const newContainer = create();
				def.setOwner(newContainer);
			}).toThrowErrorWithCode(ERRORS.OWNER_CANNOT_BE_CHANGED);
		});
	});

	describe("aliasing", () => {
		let definition: Definition;

		const annotation = { ann: 1 };
		const annotation2 = { ann: 2 };
		beforeEach(() => {
			definition = Definition.create()
				.useValue({ service: 1 })
				.annotate(annotation, annotation2);
		});

		describe("treating name", () => {
			it("uses the same", () => {
				const def = definition.createAlias();
				expect(def.name).toEqual(definition.name);
			});

			it("allows to change", () => {
				const name = "newName";
				const def = definition.createAlias({ name });

				expect(def.name).toEqual(name);
			});
		});

		describe("annotations", () => {
			it("passes no annotations by default", () => {
				const def = definition.createAlias();

				expect(def.annotations).toHaveLength(0);
			});

			it("passes all annotations if flag set to true", () => {
				const def = definition.createAlias({
					withAnnotations: true,
				});

				expect(def.annotations).toEqual(definition.annotations);
			});

			it("passes no annotations if flag set to false", () => {
				const def = definition.createAlias({
					withAnnotations: false,
				});

				expect(def.annotations).toHaveLength(0);
			});

			it("passes annotation that satisfies predicate", () => {
				//tslint:disable-next-line: strict-comparisons
				const predicate = (x: any) => x === annotation;

				const def = definition.createAlias({
					withAnnotations: predicate,
				});

				expect(def.annotations).toEqual([annotation]);
			});
		});

		describe("creating", () => {
			it("success", async () => {
				const container = create();
				const container2 = create();

				const def = definition.createAlias();

				container.registerDefinition(definition);
				container2.registerDefinition(def);

				const service = { service: "test" };
				const stub = sinon.stub().returns(service);
				definition.useFactory(stub);

				await expect(container2.get(def)).resolves.toStrictEqual(service);

				sinon.assert.calledOnce(stub);
			});

			it("fails if aliased definition has no container", () => {
				const container2 = create();

				definition = Definition.create().useValue("test");

				const def = definition.createAlias();
				container2.registerDefinition(def);

				return expect(container2.get(def)).rejects.toThrowError(
					"lack of assigned container"
				);
			});
		});
	});
});
