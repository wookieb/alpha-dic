import {Definition} from "./Definition";
import {Container} from "./Container";

export type DefinitionPredicate = (service: Definition) => boolean;
export type ServiceFactory = (...args: any[]) => any;

export type AnnotationPredicate = (annotation: Annotation) => boolean;

export type ServiceName = string | Symbol;
export type AnnotationName = string | Symbol;

export type Middleware = (definition: Definition, container: Container) => any | Promise<any>;

export interface Annotation {
    name: AnnotationName;

    [extraProperty: string]: any
}