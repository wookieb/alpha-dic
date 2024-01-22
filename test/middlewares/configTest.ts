import { configMiddleware, getConfigProviderForContainer } from "@src/middlewares/config";
import { create } from "@src/index";
import { configProviderForObject } from "@src/ConfigProvider";
import { ERRORS } from "@src/errors";
import "@pallad/errors-dev";

describe("config", () => {
	it("sets config provider on attach", () => {
		const container = create();
		const provider = configProviderForObject({});
		const middleware = configMiddleware(provider);

		expect(() => {
			getConfigProviderForContainer(container);
		}).toThrowErrorWithCode(ERRORS.CONFIG_PROVIDER_NOT_ATTACHED);
		container.addMiddleware(middleware);

		expect(getConfigProviderForContainer(container)).toStrictEqual(provider);
	});
});
