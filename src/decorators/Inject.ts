import {ContainerArg} from "../ContainerArg";
import 'reflect-metadata';
import {Reference} from "../Reference";
import * as is from 'predicates';
import {ensureMetadata} from "./serviceMetadata";


const assertServiceNameOrContainerArg = is.assert(
    is.any(is.string, is.instanceOf(ContainerArg)),
    '@Inject argument must be a string that represents service name or an object of ContainerArg instance'
);

export function Inject(serviceName: string | ContainerArg) {
    assertServiceNameOrContainerArg(serviceName);

    const arg = is.string(serviceName) ? Reference.one.name(serviceName) : serviceName;
    return function (target: any, property: string | symbol, indexOrDescriptor?: number | TypedPropertyDescriptor<any>) {
        const isParameterDecorator = typeof indexOrDescriptor === 'number';
        if (isParameterDecorator) {
            // argument decorator
            ensureMetadata(target).constructorArguments[<number>indexOrDescriptor] = arg;
        } else {
            // property decorator
            ensureMetadata(target.constructor).propertiesInjectors.set(property, arg);
        }
    }
}