import { Service } from "@src/decorators/Service";
import { Inject } from "@src/decorators/Inject";
import { ReferenceArg } from "@src/args/ReferenceArg";
import { Container } from "@src/Container";
import { Annotation } from "@src/decorators/Annotation";
import * as sinon from "sinon";
import { TypeRef } from "@src/TypeRef";
import { getDefinitionForClass } from "@src/decorators/ServiceNoAutoRegister";

describe("decorators", () => {
	it("simple service", () => {
		@Service("SomeService")
		class Test {}

		const definition = getDefinitionForClass(Test);
		expect(definition.name).toEqual("SomeService");

		const result = definition.factory(...definition.args);
		expect(result).toBeInstanceOf(Test);
	});

	it("simple service without explicit name", () => {
		@Service()
		class TestFoo {}

		const definition = getDefinitionForClass(TestFoo);
		expect(definition.name).toMatch(/^TestFoo.*/);
	});

	it("service with injected args", () => {
		@Service()
		class Foo {
			constructor(@Inject("a") readonly arg1: any) {}
		}

		const definition = getDefinitionForClass(Foo);
		expect(definition.name).toMatch(/^Foo.*/);

		expect(definition.args).toEqual([ReferenceArg.one.name("a")]);
	});

	it("Injecting advanced reference", () => {
		const ref = ReferenceArg.one.annotation(() => true);

		@Service()
		class Foo {
			constructor(@Inject(ref) readonly arg1: any) {}
		}

		const definition = getDefinitionForClass(Foo);

		expect(definition.args).toEqual([ref]);
	});

	it("injecting type ref", () => {
		class Bar {}

		const ref = TypeRef.createFromType(Bar)!;

		@Service()
		class Foo {
			constructor(@Inject(ref) readonly prop: Bar) {}
		}

		const definition = getDefinitionForClass(Foo);
		expect(definition.args).toEqual([ReferenceArg.one.type(ref)]);
	});

	it("Inject accepts only string or object of ContainerArg class", () => {
		expect(() => {
			@Service()
			class Foo {
				constructor(@Inject([] as any) readonly arg1: any) {}
			}
		}).toThrowErrorMatchingSnapshot();
	});

	it("service with injected args and properties", () => {
		@Service()
		class Foo {
			@Inject("bar")
			bar: any;

			constructor(
				@Inject("a") private arg1: any,
				@Inject("b") private arg2: any
			) {}
		}

		const definition = getDefinitionForClass(Foo);
		expect(definition.name).toMatch(/^Foo.*/);

		expect(definition.args).toEqual([
			ReferenceArg.one.name("a"),
			ReferenceArg.one.name("b"),
			ReferenceArg.one.name("bar"),
		]);

		const result = definition.factory("a", "b", "bar");

		expect(result).toBeInstanceOf(Foo);

		expect(result.bar).toEqual("bar");

		expect(result.arg1).toEqual("a");

		expect(result.arg2).toEqual("b");
	});

	it("fails if not all constructor arguments have @Inject decorators", () => {
		expect(() => {
			@Service()
			class Foo {
				constructor(
					@Inject("a") readonly arg1: any,
					readonly arg2: any
				) {}
			}
		}).toThrowError(/Required constructor arguments: 2, provided: 1/);
	});

	it("fails it there is an argument, in the middle of other arguments, without @Inject decorator", () => {
		expect(() => {
			@Service()
			class Foo {
				constructor(
					@Inject("a") readonly arg1: any,
					readonly arg2: any,
					@Inject("c") readonly arg3: any
				) {}
			}
		}).toThrowError(/Missing @Inject decorator for argument at position "1"/);
	});

	describe("using container", () => {
		let container: Container;
		beforeEach(() => {
			container = new Container();
			Service.useContainer(container);
		});

		afterEach(() => {
			Service.useContainer(undefined);
		});

		it("set container via Service.useContainer()", () => {
			@Service("Test")
			class Test {}

			expect(container.findByName("Test")).toEqual(getDefinitionForClass(Test));
		});
	});

	it("Defining annotation", () => {
		const annotation1 = { name: "test" };
		const annotation2 = { name: "test2" };

		@Annotation(annotation1)
		@Annotation(annotation2)
		@Service()
		class Test {}

		const definition = getDefinitionForClass(Test);
		expect(definition.annotations).toEqual([annotation2, annotation1]);
	});

	it("defining annotation when @Service decorator is used first", () => {
		const annotation1 = { name: "test" };
		const annotation2 = { name: "test2" };

		@Service()
		@Annotation(annotation1)
		@Annotation(annotation2)
		class Test {}

		const definition = getDefinitionForClass(Test);
		expect(definition.annotations).toEqual([annotation2, annotation1]);
	});

	describe("Service warning is no container registered", () => {
		let consoleWarnStub: sinon.SinonStub;
		beforeEach(() => {
			delete process.env.ALPHA_DIC_NO_SERVICE_CONTAINER;
			consoleWarnStub = sinon.stub(console, "warn");
		});

		afterEach(() => {
			process.env.ALPHA_DIC_NO_SERVICE_CONTAINER = "1";
			consoleWarnStub.restore();
		});

		it("test", () => {
			@Service()
			class Foo {}

			sinon.assert.calledWithMatch(
				consoleWarnStub,
				sinon.match(/There is no container registered in @Service decorator/)
			);
		});
	});
});
