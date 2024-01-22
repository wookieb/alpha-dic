import { Container } from "../Container";

import "reflect-metadata";
import { ServiceName } from "../types";
import { getDefinitionForClass, ServiceNoAutoRegister } from "./ServiceNoAutoRegister";

export interface ServiceType {
	(name?: ServiceName): ClassDecorator;

	useContainer(container?: Container): void;

	_container?: Container;
}

export const Service = function (name?: ServiceName) {
	return function (constructor: { new (...args: any[]): any }) {
		ServiceNoAutoRegister(name)(constructor);
		if (Service._container) {
			Service._container.registerDefinition(getDefinitionForClass(constructor));
		} else if (!process.env.ALPHA_DIC_NO_SERVICE_CONTAINER) {
			console.warn(
				"There is no container registered in @Service decorator. " +
					"Use Service.useContainer(container) to define the container. " +
					"Without it service definitions created via @Service decorator cannot be registered automatically. " +
					"If you wish to register service definitions manually via getDefinitionForClass set ALPHA_DIC_NO_SERVICE_CONTAINER environment variable to disable this warning."
			);
		}
	};
} as ServiceType;

Service.useContainer = function (container: Container) {
	Service._container = container;
};
