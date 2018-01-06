import {ContainerArg} from "../ContainerArg";
import {Definition} from "../Definition";
import * as errors from '../errors';
import {fromConstructor} from '../serviceFactories';

require('reflect-metadata');

const KEY = Symbol('__alphaDic-ServiceMetadata');
const DEFINITION_KEY = Symbol('__alphaDic-ServiceDefinition');

export interface ClassServiceMetadata {
    name?: string;
    constructorArguments: ContainerArg[]
    propertiesInjectors: Map<string | symbol, ContainerArg>;
    annotations: any[];
}

export function ensureMetadata(target: any): ClassServiceMetadata {
    let data: ClassServiceMetadata = getMetadata(target);
    if (!data) {
        data = {
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

export function getDefinitionForClass(clazz: Function) {
    let definition = Reflect.getMetadata(DEFINITION_KEY, clazz);
    if (!definition) {
        const metadata = getMetadata(clazz);
        definition = createDefinitionFromMetadata(metadata, clazz);
        Reflect.defineMetadata(DEFINITION_KEY, definition, clazz);
    }
    return definition;
}

export function createDefinitionFromMetadata(metadata: ClassServiceMetadata, constructor: Function) {
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
        .annotate(...metadata.annotations);
}

function assertValidServiceDefinition(constructor: Function, metadata: ClassServiceMetadata) {
    if (constructor.length > metadata.constructorArguments.length) {
        throw errors.INVALID_SERVICE_ARGUMENTS_LENGTH(
            `Invalid service "${metadata.name}" definition. Required constructor arguments: ${constructor.length}, provided: ${metadata.constructorArguments.length}`
        );
    }

    for (let i = 0; i < metadata.constructorArguments.length; i++) {
        const arg = metadata.constructorArguments[i];
        if (!arg) {
            throw errors.MISSING_INJECT_DECORATOR(
                `Missing @Inject decorator for argument at position "${i}". Every constructor argument needs to have @Inject decorator`
            )
        }
    }
}