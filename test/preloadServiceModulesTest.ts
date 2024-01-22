import { preloadServiceModules } from "@src/preloadServiceModules";
import { Container, Definition } from "@src/.";

describe("preloadServiceModules", () => {
	it("loads services for given files pattern", () => {
		const container = new Container();

		preloadServiceModules(container, "./fixtures/servicesViaDecorators/test1_*.ts", {
			cwd: __dirname,
		});

		expect(container.findByName("Test1_Service1")).toBeInstanceOf(Definition);
		expect(container.findByName("Test1_Service2")).toBeInstanceOf(Definition);
		expect(container.findByName("ExcludedService")).toBeUndefined();
	});

	it("multiple patterns", () => {
		const container = new Container();

		preloadServiceModules(
			container,
			[
				"./fixtures/servicesViaDecorators/test2_service.ts",
				"./fixtures/servicesViaDecorators/test2_service2.ts",
			],
			{
				cwd: __dirname,
			}
		);

		expect(container.findByName("Test2_Service1")).toBeInstanceOf(Definition);
		expect(container.findByName("Test2_Service2")).toBeInstanceOf(Definition);
		expect(container.findByName("ExcludedService")).toBeUndefined();
	});
});
