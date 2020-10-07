import {Service} from "./Service";
import {ServiceName} from "../types";
import {ensureMetadata} from "../serviceMetadata";
import * as is from "predicates";
import {TypeRef} from "../TypeRef";
import {errors, ReferenceArg} from "../index";
import {format} from "util";

export function AutowiredService(name?: ServiceName): ClassDecorator {
    return (clazz: Function) => {
        const paramTypes: Function[] = Reflect.getMetadata("design:paramtypes", clazz);
        const metadata = ensureMetadata(clazz);

        if (is.array(paramTypes) && clazz.length > 0) {
            for (const [index, paramType] of paramTypes.entries()) {
                if (metadata.constructorArguments[index]) {
                    continue;
                }
                const ref = TypeRef.createFromType(paramType);
                if (ref === undefined) {
                    throw errors.AUTOWIRING_FAILED(
                        format(errors.AUTOWIRING_FAILED.defaultMessage, `constructor (of ${clazz.name}) argument nr: ${index}`)
                    );
                }
                metadata.constructorArguments[index] = ReferenceArg.one.type(ref);
            }
        } else if (clazz.length > 0) {
            throw errors.AUTOWIRING_NO_METADATA();
        }
        Service(name)(clazz);
    }
}