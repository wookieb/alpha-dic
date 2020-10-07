import {ContainerArg} from './args/ContainerArg';
import {Definition} from './Definition';
import * as errors from './errors';
import {fromConstructor} from './serviceFactories';
import {ServiceName} from './types';

require('reflect-metadata');

const KEY = Symbol('__alphaDic-ServiceMetadata');

export interface ClassServiceMetadata {
    name?: ServiceName;
    clazz: Function,
    constructorArguments: Array<ContainerArg | any>
    propertiesInjectors: Map<string | symbol, any>;
    annotations: any[];
}

/**
 * Creates service metadata data for given class if it doesn't exist. Otherwise returns current service metadata.
 */
export function ensureMetadata(target: Function): ClassServiceMetadata {
    let data: ClassServiceMetadata = getMetadata(target);
    if (!data) {
        data = {
            clazz: target,
            propertiesInjectors: new Map(),
            constructorArguments: [],
            annotations: []
        };
        Reflect.defineMetadata(KEY, data, target);
    }
    return data;
}

export function getMetadata(target: any) {
    return Reflect.getMetadata(KEY, target);
}

export function createDefinitionFromMetadata(metadata: ClassServiceMetadata, constructor: { new(...args: any[]): any }) {
    assertValidServiceDefinition(constructor, metadata);
    const definition = new Definition(metadata.name);
    const args = metadata.constructorArguments.concat(Array.from(metadata.propertiesInjectors.values()));

    return definition.withArgs(...args)
        .useFactory((...args: any[]) => {
            // create service from constructor
            const constructorArgs = args.slice(0, metadata.constructorArguments.length);
            const service = fromConstructor(constructor)(...constructorArgs);

            // inject to properties
            const propertiesInjectionsStartIndex = metadata.constructorArguments.length;
            let propertyInjectionIndex = 0;
            for (const [propertyName] of metadata.propertiesInjectors.entries()) {
                service[propertyName] = args[propertiesInjectionsStartIndex + propertyInjectionIndex++];
            }
            return service;
        })
        .markType(metadata.clazz)
        .annotate(...metadata.annotations);
}

function assertValidServiceDefinition(constructor: Function, metadata: ClassServiceMetadata) {
    if (constructor.length > metadata.constructorArguments.length) {
        throw errors.INVALID_SERVICE_ARGUMENTS_LENGTH(
            `Invalid service "${metadata.name!.toString()}" definition. Required constructor arguments: ${constructor.length}, provided: ${metadata.constructorArguments.length}`
        );
    }

    for (let i = 0; i < metadata.constructorArguments.length; i++) {
        const arg = metadata.constructorArguments[i];
        if (!arg) {
            throw errors.MISSING_INJECT_DECORATOR(
                `Missing @Inject decorator for argument at position "${i}". Every constructor argument needs to have @Inject decorator`
            );
        }
    }
}