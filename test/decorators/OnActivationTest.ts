import { getDefinitionForClass, onActivation, Service } from "@src/.";
import { OnActivation } from "@src/decorators/OnActivation";

describe("OnActivation", () => {
	it("defines annotation", () => {
		// tslint:disable-next-line:no-empty
		const func = function () {};

		@Service()
		@OnActivation(func)
		class Foo {}

		const definition = getDefinitionForClass(Foo);
		const annotation = onActivation(func);
		expect(definition.annotations).toEqual([annotation]);
	});
});
