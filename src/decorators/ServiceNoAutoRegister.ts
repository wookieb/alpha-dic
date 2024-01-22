import { ensureMetadata, createDefinitionFromMetadata } from "../serviceMetadata";

import "reflect-metadata";
import { ServiceName } from "../types";
import { randomName } from "../randomName";
import { Definition } from "../Definition";

const DEFINITION_KEY = Symbol("__alphaDic-ServiceDefinition");
export const ServiceNoAutoRegister = function (name?: ServiceName) {
	return function (constructor: { new (...args: any[]): any }) {
		const finalName = name || randomName(constructor.name);

		const metadata = ensureMetadata(constructor);
		metadata.name = finalName;

		const definition = createDefinitionFromMetadata(metadata, constructor);
		Reflect.defineMetadata(DEFINITION_KEY, definition, constructor);
	};
};

export function getDefinitionForClass(clazz: Function): Definition {
	return Reflect.getMetadata(DEFINITION_KEY, clazz);
}
