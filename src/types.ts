import {Definition} from './Definition';
import * as isPred from 'predicates';
import {Container} from "./Container";

export type DefinitionPredicate = (service: Definition) => boolean;
export type ServiceFactory = (...args: any[]) => any;

export type AnnotationPredicate = (annotation: any) => boolean;

export type ServiceName = string | symbol;
export namespace ServiceName {
    export function is(value: any): value is ServiceName {
        return isPred.string(value) || isPred.symbol(value);
    }
}

export const onMiddlewareAttach = Symbol('alphaDic-onMiddlewareAttach');

export interface Middleware {
    (this: Container, definition: Definition, next: (service: any) => any | Promise<any>): any | Promise<any>;

    [onMiddlewareAttach]?: (container: Container) => void
}
