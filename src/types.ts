import {Definition} from './Definition';

export type DefinitionPredicate = (service: Definition) => boolean;
export type ServiceFactory = (...args: any[]) => any;

export type AnnotationPredicate = (annotation: any) => boolean;

export type ServiceName = string | symbol;

export type Middleware = (definition: Definition, next: (service: any) => any | Promise<any>) => any | Promise<any>;
