import {ConfigRequestArg} from "../args/ConfigRequestArg";
import {ensureMetadata} from "../serviceMetadata";

export function Config(path: string, defaultValue?: any): ParameterDecorator & PropertyDecorator;
export function Config(...args: [string, undefined | any]): ParameterDecorator & PropertyDecorator {
    const request = ConfigRequestArg.create(...args);

    return function (target: any, property: string | symbol, indexOrDescriptor?: number | TypedPropertyDescriptor<any>) {
        const isParameterDecorator = typeof indexOrDescriptor === 'number';
        if (isParameterDecorator) {
            ensureMetadata(target).constructorArguments[indexOrDescriptor as number] = request;
        } else {
            ensureMetadata(target.constructor).propertiesInjectors.set(property, request);
        }
    }
}