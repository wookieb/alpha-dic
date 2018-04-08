import {ConfigRequest} from "../ConfigRequest";
import {ensureMetadata} from "../serviceMetadata";

export function Config(path: string, defaultValue?: any) {
    const request = ConfigRequest.create.apply(null, Array.prototype.slice.call(arguments));

    return function (target: any, property: string | symbol, indexOrDescriptor?: number | TypedPropertyDescriptor<any>) {
        const isParameterDecorator = typeof indexOrDescriptor === 'number';
        if (isParameterDecorator) {
            ensureMetadata(target).constructorArguments[<number>indexOrDescriptor] = request;
        } else {
            ensureMetadata(target.constructor).propertiesInjectors.set(property, request);
        }
    }
}