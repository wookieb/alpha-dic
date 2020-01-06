import * as errors from './errors';
import {Container} from './Container';
import {activationMiddleware} from './middlewares/activation';
import {configMiddleware} from './middlewares/config';
import {configProviderForObject} from './ConfigProvider';
import {Service} from './decorators/Service';
import {deprecatedMiddleware, DeprecationMessageFunc} from './middlewares/deprecated';

export * from './Definition';
export * from './Container';
export * from './Reference';
export * from './types';
export * from './ContainerArg';
export * from './referenceFunc';
export * from './configFunc';
export * from './Lookup';
export * from './middlewares/activation';
export * from './middlewares/config';
export * from './middlewares/deprecated';
export {Service, getDefinitionForClass} from './decorators/Service';
export {Annotation} from './decorators/Annotation';
export {Inject} from './decorators/Inject';
export {Config} from './decorators/Config';
export {Deprecated} from './decorators/Deprecated';
export {OnActivation} from './decorators/OnActivation';
export {preloadServiceModules} from './preloadServiceModules';
export {createNamespace, namespaceEntry} from './createNamespace';

export {errors};

export function create(parent?: Container) {
    return new Container(parent);
}


export interface StandardContainerOptions {
    /**
     * Configuration object for @Config decorators and annotations
     */
    config?: object,

    /**
     * A function that is responsible for displaying deprecation note. By default console.warn used
     */
    deprecationMessageFunc?: DeprecationMessageFunc,

    /**
     * Parent container
     */
    parent?: Container;

    /**
     * Whether to inform @Service decorator to use newly created container
     */
    configureServiceDecorator?: boolean
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
    const configureServiceDecorator = options.configureServiceDecorator === undefined ? true : options.configureServiceDecorator;
    if (configureServiceDecorator) {
        Service.useContainer(container);
    }
    container
        .addMiddleware(activationMiddleware)
        .addMiddleware(configMiddleware(configProviderForObject(opts.config || {})))
        .addMiddleware(deprecatedMiddleware(opts.deprecationMessageFunc));
    return container;
}

export const createContainer = create;