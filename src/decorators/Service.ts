import {Container} from "../Container";
import {getDefinitionForClass, ensureMetadata, getMetadata} from "./serviceMetadata";
import * as errors from '../errors';

export interface ServiceType {
    (name?: string): ClassDecorator;

    useContainer(container: Container): void;

    _container?: Container
}


export const Service = <ServiceType>function (name?: string) {
    return function (constructor: Function) {
        const finalName = name || constructor.name;

        if (!finalName) {
            throw errors.NO_SERVICE_NAME();
        }

        const metadata = ensureMetadata(constructor);
        metadata.name = finalName;

        const definition = getDefinitionForClass(constructor);

        if (Service._container) {
            Service._container.registerDefinition(definition);
        }
    }
};

Service.useContainer = function (container: Container) {
    Service._container = container;
};


