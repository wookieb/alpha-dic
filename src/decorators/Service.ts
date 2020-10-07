import {Container} from "../Container";
import {ensureMetadata, createDefinitionFromMetadata} from "../serviceMetadata";

import 'reflect-metadata';
import {Definition} from "../Definition";
import {ServiceName} from "../types";
import {randomName} from "../randomName";

export interface ServiceType {
    (name?: ServiceName): ClassDecorator;

    useContainer(container?: Container): void;

    _container?: Container
}

const DEFINITION_KEY = Symbol('__alphaDic-ServiceDefinition');
export const Service = function (name?: ServiceName) {
    return function (constructor: {new(...args: any[]): any}) {
        const finalName = name || randomName(constructor.name);

        const metadata = ensureMetadata(constructor);
        metadata.name = finalName;

        const definition = createDefinitionFromMetadata(metadata, constructor);
        Reflect.defineMetadata(DEFINITION_KEY, definition, constructor);

        if (Service._container) {
            Service._container.registerDefinition(definition);
        } else if (!process.env.ALPHA_DIC_NO_SERVICE_CONTAINER) {
            console.warn('There is no container registered in @Service decorator. ' +
                'Use Service.useContainer(container) to define the container. ' +
                'Without it service definitions created via @Service decorator cannot be registered automatically. ' +
                'If you wish to register service definitions manually via getDefinitionForClass set ALPHA_DIC_NO_SERVICE_CONTAINER environment variable to disable this warning.')
        }
    }
} as ServiceType;

Service.useContainer = function (container: Container) {
    Service._container = container;
};

export function getDefinitionForClass(clazz: Function): Definition {
    return Reflect.getMetadata(DEFINITION_KEY, clazz);
}
