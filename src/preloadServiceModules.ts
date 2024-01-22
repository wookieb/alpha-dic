import { IOptions, sync } from "glob";
import { Service } from "./decorators/Service";
import { Container } from "./Container";

export function preloadServiceModules(
	container: Container,
	globPattern: string | string[],
	globOptions: IOptions = {}
) {
	console.warn('"preloadServiceModules" is deprecated. Use "loadServices" instead.');
	Service.useContainer(container);
	const patterns = Array.isArray(globPattern) ? globPattern : [globPattern];

	const finalGlobOptions = {
		...globOptions,
		...{ realpath: true },
	};

	for (const pattern of patterns) {
		const modulesPaths = sync(pattern, finalGlobOptions);

		for (const modulePath of modulesPaths) {
			require(modulePath);
		}
	}
}
