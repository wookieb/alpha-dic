import * as errors from './errors';
import {Container} from './Container';


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

export const createContainer = create;

export {Service, getDefinitionForClass} from './decorators/Service';
export {Annotation} from './decorators/Annotation';
export {Inject} from './decorators/Inject';
export {Config} from './decorators/Config';