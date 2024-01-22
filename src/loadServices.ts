import * as is from "predicates";
import { Predicate } from "predicates/types";
import { sync } from "glob";
import { Container } from "./Container";
import { Service } from "./decorators/Service";

function createExtensionsPredicate(
	extensions: string[],
	defaultResult: boolean
): Predicate<string> {
	if (extensions.length === 0) {
		return () => defaultResult;
	}

	if (extensions.length === 1) {
		return createExtensionPredicate(extensions[0]);
	}
	return is.or(...extensions.map(createExtensionPredicate));
}

function createExtensionPredicate(ext: string) {
	return is.endsWith(`.${ext}`);
}

export function loadServices(container: Container, opts?: loadServices.Options) {
	Service.useContainer(container);
	const extensions = opts?.extensions ?? ["ts", "js", "tsx"];
	const excludedExtensions = opts?.excludedExtensions ?? ["d.ts", "d.tsx"];
	const patterns = opts?.patterns
		? is.arr(opts.patterns)
			? opts.patterns
			: [opts.patterns]
		: ["**/*"];

	const isMatchingExtension = createExtensionsPredicate(extensions, true);
	const isExcludedExtension = createExtensionsPredicate(excludedExtensions, false);

	const isValidExtension = is.and(isMatchingExtension, is.not(isExcludedExtension));

	for (const pattern of patterns) {
		const modulesPaths = sync(pattern, {
			cwd: opts?.currentDir,
			nodir: true,
			realpath: true,
			nosort: true,
		});

		for (const modulePath of modulesPaths) {
			if (isValidExtension(modulePath)) {
				require(modulePath);
			}
		}
	}
}

export namespace loadServices {
	export interface Options {
		currentDir?: string;
		patterns?: string | string[];
		extensions?: string[];
		excludedExtensions?: string[];
	}
}
