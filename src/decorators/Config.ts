import { ConfigRequestArg } from "../args/ConfigRequestArg";
import { ensureMetadata } from "../serviceMetadata";

export function Config<T>(...args: [string, undefined | T] | [string]) {
	const request = ConfigRequestArg.create(...(args as [string, undefined | T]));

	return function (
		target: any,
		property: string | symbol | undefined,
		indexOrDescriptor?: number | TypedPropertyDescriptor<any>
	) {
		const isParameterDecorator = typeof indexOrDescriptor === "number";
		if (isParameterDecorator) {
			ensureMetadata(target).constructorArguments[indexOrDescriptor as number] = request;
		} else if (property) {
			ensureMetadata(target.constructor).propertiesInjectors.set(property, request);
		}
	};
}
