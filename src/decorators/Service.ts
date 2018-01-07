import {Container} from "../Container";
import {ensureMetadata, createDefinitionFromMetadata} from "./serviceMetadata";
import * as errors from '../errors';

import 'reflect-metadata';
import {Definition} from "../Definition";

export interface ServiceType {
    (name?: string): ClassDecorator;

    useContainer(container: Container): void;

    _container?: Container
}


const DEFINITION_KEY = Symbol('__alphaDic-ServiceDefinition');

export const Service = <ServiceType>function (name?: string) {
    return function (constructor: Function) {
        const finalName = name || constructor.name;

        if (!finalName) {
            throw errors.NO_SERVICE_NAME();
        }

        const metadata = ensureMetadata(constructor);
        metadata.name = finalName;

        const definition = createDefinitionFromMetadata(metadata, constructor);
        Reflect.defineMetadata(DEFINITION_KEY, definition, constructor);

        if (Service._container) {
            Service._container.registerDefinition(definition);
        }
    }
};

Service.useContainer = function (container: Container) {
    Service._container = container;
};

export function getDefinitionForClass(clazz: Function): Definition {
    return Reflect.getMetadata(DEFINITION_KEY, clazz);
}
