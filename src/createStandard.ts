import { deprecatedMiddleware, DeprecationMessageFunc } from "./middlewares/deprecated";
import { Container } from "./Container";
import { Service } from "./decorators/Service";
import { activationMiddleware } from "./middlewares/activation";
import { configMiddleware } from "./middlewares/config";
import { configProviderForObject } from "./ConfigProvider";

export interface StandardContainerOptions {
	/**
	 * Configuration object for @Config decorators and annotations
	 */
	config?: object;

	/**
	 * A function that is responsible for displaying deprecation note. By default console.warn used
	 */
	deprecationMessageFunc?: DeprecationMessageFunc;

	/**
	 * Parent container
	 */
	parent?: Container;

	/**
	 * Whether to inform @Service decorator to use newly created container
	 */
	configureServiceDecorator?: boolean;
}

/**
 * Creates preconfigured container:
 * * has all middlewares registered
 * * @Service decorator uses new container
 * * configMiddleware that uses given config object
 */
export function createStandard(options: StandardContainerOptions = {}) {
	const container = new Container(options.parent);
	const opts = options || {};
	const configureServiceDecorator =
		options.configureServiceDecorator === undefined ? true : options.configureServiceDecorator;
	if (configureServiceDecorator) {
		Service.useContainer(container);
	}
	container
		.addMiddleware(activationMiddleware)
		.addMiddleware(configMiddleware(configProviderForObject(opts.config || {})))
		.addMiddleware(deprecatedMiddleware(opts.deprecationMessageFunc));
	return container;
}
