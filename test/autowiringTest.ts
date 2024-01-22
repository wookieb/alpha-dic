import { Container, Service } from "@src/.";
import { AutowiredService } from "@src/decorators/AutowiredService";
import { Inject } from "@src/decorators/Inject";

describe("autowiring", () => {
	let container: Container;

	const NAME = "example";

	class Foo implements FooInterface {
		// tslint:disable-next-line:no-empty
		bonk() {}
	}

	interface FooInterface {
		bonk(): void;
	}

	class Bar {}

	beforeEach(() => {
		container = new Container();

		container.definitionWithConstructor("foo", Foo);
		container.definitionWithConstructor("bar", Bar);
		Service.useContainer(container);
	});

	afterEach(() => {
		Service._container = undefined;
	});

	it("simple", async () => {
		@AutowiredService(NAME)
		class Example {
			constructor(readonly foo: Foo) {}
		}

		const service = await container.get<Example>(NAME);

		expect(service).toBeInstanceOf(Example);

		expect(service.foo).toBeInstanceOf(Foo);
	});

	it("with properties", async () => {
		@AutowiredService(NAME)
		class Example {
			@Inject()
			bar!: Bar;

			@Inject()
			foo!: Foo;
		}

		const service = await container.get<Example>(NAME);

		expect(service.bar).toBeInstanceOf(Bar);
		expect(service.foo).toBeInstanceOf(Foo);
	});

	it("nothing to autowire", async () => {
		@AutowiredService(NAME)
		class Example {}

		const service = await container.get<Example>(NAME);
		expect(service).toBeInstanceOf(Example);
	});

	describe("overwriting an argument", () => {
		it("with type reference", async () => {
			@AutowiredService(NAME)
			class Example {
				constructor(@Inject(Bar) readonly foo: Foo) {}
			}

			const service = await container.get<Example>(NAME);

			expect(service.foo).toBeInstanceOf(Bar);
		});

		it("with explicit reference", async () => {
			@AutowiredService(NAME)
			class Example {
				constructor(@Inject("bar") readonly foo: Foo) {}
			}

			const service = await container.get<Example>(NAME);
			expect(service.foo).toBeInstanceOf(Bar);
		});

		it("interface reference", async () => {
			@AutowiredService(NAME)
			class Example {
				constructor(@Inject(Foo) readonly foo: FooInterface) {}
			}

			const service = await container.get<Example>(NAME);
			expect(service.foo).toBeInstanceOf(Foo);
		});
	});

	describe("fails", () => {
		it("could not autowire interfaces", () => {
			expect(() => {
				@AutowiredService(NAME)
				class Example {
					constructor(readonly foo: FooInterface) {}
				}
			}).toThrowErrorMatchingSnapshot();
		});

		it("could not use @Inject without arg for arguments", () => {
			expect(() => {
				const Inj = Inject as any;

				@AutowiredService(NAME)
				class Example {
					constructor(@Inj() readonly arg: any) {}
				}
			}).toThrowErrorMatchingSnapshot();
		});

		it("could not autowire union types", () => {
			expect(() => {
				@AutowiredService()
				class Example {
					constructor(readonly arg: Foo | Bar) {}
				}
			}).toThrowErrorMatchingSnapshot();
		});

		it("multiple instances of same type", () => {
			container.definitionWithConstructor("another", Foo);

			@AutowiredService(NAME)
			class Example {
				constructor(readonly foo: Foo) {}
			}

			return expect(container.get(NAME)).rejects.toThrowErrorMatchingSnapshot();
		});

		it("explicit referencing reserved type", () => {
			expect(() => {
				@AutowiredService(NAME)
				class Example {
					constructor(@Inject(Object) readonly foo: Foo) {}
				}
			}).toThrowErrorMatchingSnapshot();
		});
	});
});
