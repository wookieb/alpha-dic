import { configProviderForObject } from "@src/ConfigProvider";
import { ConfigRequestArg } from "@src/args/ConfigRequestArg";

describe("configProviderForObject", () => {
	const provider = configProviderForObject({
		foo: "bar",
		nested: {
			foo: "zar",
			nested2: {
				foo: "car",
			},
		},
	});

	const DEFAULT = "defaultValue";

	it("getting by simple path", () => {
		expect(provider(new ConfigRequestArg("foo"))).toEqual("bar");
		expect(provider(new ConfigRequestArg("foo", DEFAULT))).toEqual("bar");
		expect(provider(new ConfigRequestArg("bar", DEFAULT))).toEqual(DEFAULT);
	});

	it("getting at nested path", () => {
		expect(provider(new ConfigRequestArg("nested.foo"))).toEqual("zar");
		expect(provider(new ConfigRequestArg("nested.foo", DEFAULT))).toEqual("zar");
		expect(provider(new ConfigRequestArg("nested.bar", DEFAULT))).toEqual(DEFAULT);
	});

	it("getting as double nested path", () => {
		expect(provider(new ConfigRequestArg("nested.nested2.foo"))).toEqual("car");
		expect(provider(new ConfigRequestArg("nested.nested2.foo", DEFAULT))).toEqual("car");
		expect(provider(new ConfigRequestArg("nested.nested2.bar", DEFAULT))).toEqual(DEFAULT);
	});

	it("fails if config not defined and no default value set", () => {
		expect(() => {
			provider(new ConfigRequestArg("bar"));
		}).toThrowError(/Config at path "bar" is not defined/);
	});
});
