import {Definition} from './Definition';
import * as isPred from 'predicates';

export type DefinitionPredicate = (service: Definition) => boolean;
export type ServiceFactory = (...args: any[]) => any;

export type AnnotationPredicate = (annotation: any) => boolean;

export type ServiceName = string | symbol;
export namespace ServiceName {
    export function is(value: any): value is ServiceName {
        return isPred.string(value) || isPred.symbol(value);
    }
}

export type Middleware = (definition: Definition, next: (service: any) => any | Promise<any>) => any | Promise<any>;
