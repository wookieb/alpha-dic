import { deprecated, Deprecated, getDefinitionForClass, Service } from "@src/.";

describe("Deprecated", () => {
	const NOTE = "Some deprecation note";

	it("adding to a class", () => {
		@Deprecated(NOTE)
		@Service()
		class SomeClass {}

		const definition = getDefinitionForClass(SomeClass);
		const annotation = deprecated(NOTE);
		expect(definition.annotations).toContainEqual(annotation);
	});
});
