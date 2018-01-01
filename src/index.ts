import * as errors from './errors';
import {Container} from "./Container";

export * from './Definition';
export * from './Container';
export * from './Reference';
export * from './types';
export * from './ContainerArg'
export * from './referenceFunc';

export {errors};

export function create() {
    return new Container();
}