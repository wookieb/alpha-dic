import { Service } from "./Service";
import { ServiceName } from "../types";
import { ensureMetadata } from "../serviceMetadata";
import * as is from "predicates";
import { TypeRef } from "../TypeRef";
import { ReferenceArg } from "../index";
import { ERRORS } from "../errors";

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
					throw ERRORS.AUTO_WIRING_FAILED.create(
						`constructor (of ${clazz.name}) argument nr: ${index}`
					);
				}
				metadata.constructorArguments[index] = ReferenceArg.one.type(ref);
			}
		} else if (clazz.length > 0) {
			throw ERRORS.AUTO_WIRING_NO_METADATA.create();
		}
		Service(name)(clazz);
	};
}
