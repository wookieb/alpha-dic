import { create, loadServices, Container, Service } from "@src/index";
import * as path from "path";

describe("loadServices", () => {
	const ROOT_DIR = path.resolve(__dirname, "./fixtures/loadServices");
	let container: Container;
	beforeEach(() => {
		container = create();
		Service.useContainer(container);
	});

	it("basic example", () => {
		jest.isolateModules(() => {
			require('@src/decorators/Service').Service.useContainer(container);
			loadServices(container, {
				currentDir: ROOT_DIR,
			});
		});

		expect(container.findByName("NestedExample")).toBeDefined();
		expect(container.findByName("Example")).toBeDefined();
		expect(container.findByName("Example2")).toBeDefined();
		expect(container.findByName("JSExample")).toBeDefined();
		expect(container.findByName("TSXExample")).toBeDefined();
	});

	it("pattern", () => {
		jest.isolateModules(() => {
			require('@src/decorators/Service').Service.useContainer(container);
			loadServices(container, {
				currentDir: ROOT_DIR,
				patterns: ["./Example.*"],
			});
		});

		expect(container.findByName("NestedExample")).not.toBeDefined();
		expect(container.findByName("Example")).toBeDefined();
		expect(container.findByName("Example2")).not.toBeDefined();
		expect(container.findByName("JSExample")).not.toBeDefined();
		expect(container.findByName("TSXExample")).not.toBeDefined();
	});

	it("with extension filter", () => {
		jest.isolateModules(() => {
			require('@src/decorators/Service').Service.useContainer(container);
			loadServices(container, {
				currentDir: ROOT_DIR,
				extensions: ["tsx"],
			});
		});

		expect(container.findByName("NestedExample")).not.toBeDefined();
		expect(container.findByName("Example")).not.toBeDefined();
		expect(container.findByName("Example2")).not.toBeDefined();
		expect(container.findByName("JSExample")).not.toBeDefined();
		expect(container.findByName("TSXExample")).toBeDefined();
	});
});
