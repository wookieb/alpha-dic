import { Container } from "./Container";
import { Definition } from "./Definition";
import { ContainerArg } from "./args/ContainerArg";
import * as errors from "./errors";
import { ERRORS } from "./errors";

export function assertNoCircularDependencies(container: Container, currentDefinition: Definition) {
	detectCircularDependencies(container, currentDefinition, [currentDefinition]);
}

function detectCircularDependencies(
	container: Container,
	definition: Definition,
	previousDefinitions: Definition[]
) {
	for (const arg of definition.args) {
		if (arg instanceof ContainerArg) {
			const dependencies = arg.getDependentServices(container);
			if (!dependencies) {
				continue;
			}
			for (const dependency of Array.isArray(dependencies) ? dependencies : [dependencies]) {
				if (previousDefinitions.indexOf(dependency) !== -1) {
					const names = previousDefinitions
						.concat([dependency])
						.map(d => d.name.toString());
					throw ERRORS.CIRCULAR_DEPENDENCY_DETECTED.create(names);
				}
				detectCircularDependencies(
					container,
					dependency,
					previousDefinitions.concat([dependency])
				);
			}
		}
	}
}
