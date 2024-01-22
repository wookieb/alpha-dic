import { Container } from "@src/Container";
import { ReferenceArg } from "@src/args/ReferenceArg";
import { ERRORS } from "@src/errors";
import "@pallad/errors-dev";
import { assertNoCircularDependencies } from "@src/assertNoCircularDependencies";

let container: Container;

function assertCircularDependencyFound(serviceName: string, dependenciesPath: string[]) {
	try {
		assertNoCircularDependencies(container, container.findByName(serviceName)!);
		throw new Error("Circular dependency error expected");
	} catch (e) {
		expect(e).toHaveProperty("code", ERRORS.CIRCULAR_DEPENDENCY_DETECTED.code);

		const foundDependenciesPath = (e as Error).message
			.substr(((e as Error).message.indexOf("found: ") as number) + 6)
			.split(" -> ")
			.map((s: string) => s.trim());

		expect(foundDependenciesPath).toEqual(dependenciesPath);
	}
}

describe("assertNoCircularDependencies", () => {
	beforeEach(() => {
		container = new Container();
	});

	it("simple circular dependency", () => {
		container.definition("A").withArgs(ReferenceArg.one.name("B"));

		container.definition("B").withArgs(ReferenceArg.one.name("A"));

		assertCircularDependencyFound("A", ["A", "B", "A"]);
	});

	it("simple circular dependency for services with regular arguments", () => {
		container.definition("A").withArgs("foo", "bar", ReferenceArg.one.name("B"), "foo1");

		container.definition("B").withArgs(ReferenceArg.one.name("A"), "bar");
		assertCircularDependencyFound("A", ["A", "B", "A"]);
	});

	describe("2 level circular dependency", () => {
		it("simple", () => {
			container.definition("A").withArgs(ReferenceArg.one.name("B"));

			container.definition("B").withArgs(ReferenceArg.one.name("C"));

			container.definition("C").withArgs(ReferenceArg.one.name("A"));

			assertCircularDependencyFound("A", ["A", "B", "C", "A"]);
		});

		it("dependency of dependency", () => {
			container.definition("A").withArgs(ReferenceArg.one.name("B"));

			container.definition("B").withArgs(ReferenceArg.one.name("C"));

			container.definition("C").withArgs(ReferenceArg.one.name("B"));

			assertCircularDependencyFound("A", ["A", "B", "C", "B"]);
		});

		it("with multi services arg", () => {
			container.definition("A").withArgs(ReferenceArg.one.name("B"));

			container.definition("B").withArgs(ReferenceArg.one.name("C"));

			container
				.definition("C")
				.withArgs(ReferenceArg.multi.predicate(d => d.name === "A" || d.name === "B"));

			assertCircularDependencyFound("A", ["A", "B", "C", "A"]);
		});
	});

	it("3 levels circular dependency", () => {
		container.definition("A").withArgs(ReferenceArg.one.name("B"));

		container.definition("B").withArgs(ReferenceArg.one.name("C"));

		container.definition("C").withArgs(ReferenceArg.one.name("D"));

		container.definition("D").withArgs(ReferenceArg.one.name("A"));

		assertCircularDependencyFound("A", ["A", "B", "C", "D", "A"]);
	});
});
