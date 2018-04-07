import * as errors from './errors';
import {Container} from './Container';
import {activationMiddleware} from "./middlewares/activation";
import {configMiddleware} from "./middlewares/config";
import {configProviderForObject} from "./ConfigProvider";
import {Service} from "./decorators/Service";


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

export {errors};

export function create() {
    return new Container();
}

export function createStandard(config: object) {
    const container = new Container();

    Service.useContainer(container);
    container
        .addMiddleware(activationMiddleware)
        .addMiddleware(configMiddleware(configProviderForObject(config)));

    return container;
}

export const createContainer = create;

export {Service, getDefinitionForClass} from './decorators/Service';
export {Annotation} from './decorators/Annotation';
export {Inject} from './decorators/Inject';
export {Config} from './decorators/Config';
export {preloadServiceModules} from './preloadServiceModules';