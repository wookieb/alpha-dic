import {ContainerArg} from "../ContainerArg";
import 'reflect-metadata';
import {Reference} from "../Reference";
import * as is from 'predicates';
import {ensureMetadata} from "../serviceMetadata";
import {ServiceName} from "../types";
import {TypeRef} from "../TypeRef";
import {errors} from "../index";
import {format} from 'util';

const assertServiceNameOrContainerArg = is.assert(
    is.any(ServiceName.is, ContainerArg.is, TypeRef.is, is.func, is.undefined),
    '@Inject argument must be a string that represents service name, symbol, function or instance of ContainerArg or TypeRef'
);

export function Inject(ref: ServiceName | ContainerArg | Function): ParameterDecorator & PropertyDecorator;
export function Inject(): PropertyDecorator;
export function Inject(ref?: ServiceName | ContainerArg | Function): PropertyDecorator | ParameterDecorator {
    assertServiceNameOrContainerArg(ref);

    return function (target: any, property: string | symbol, indexOrDescriptor?: number | TypedPropertyDescriptor<any>) {
        const isParameterDecorator = typeof indexOrDescriptor === 'number';

        let arg: Reference | ContainerArg;

        if (ref === undefined) {
            if (isParameterDecorator) {
                throw new Error('Using @Inject decorator without ref for function arguments is prohibited');
            } else {
                const designType = Reflect.getMetadata("design:type", target, property);
                arg = createReferenceForType(designType, `property ${property.toString()}`);
            }
        } else if (TypeRef.is(ref)) {
            arg = Reference.one.type(ref);
        } else if (ServiceName.is(ref)) {
            arg = Reference.one.name(ref);
        } else if (ContainerArg.is(ref)) {
            arg = ref;
        } else {
            arg = createReferenceForType(
                ref,
                isParameterDecorator ? `constructor (of ${target.name}) argument nr: ${indexOrDescriptor}` : `property ${property.toString()}`
            );
        }

        if (isParameterDecorator) {
            ensureMetadata(target).constructorArguments[<number>indexOrDescriptor] = arg!;
        } else {
            ensureMetadata(target.constructor).propertiesInjectors.set(property, arg!);
        }
    }
}

function createReferenceForType(func: Function, ...args: string[]) {
    const type = TypeRef.createFromType(func);
    if (type === undefined) {
        throw errors.AUTOWIRING_FAILED(
            format(errors.AUTOWIRING_FAILED.defaultMessage, ...args)
        );
    }
    return Reference.one.type(type);
}