import { Domain, formatCodeFactory, ErrorDescriptor } from "@pallad/errors";
import { Lookup } from "./Lookup";

const code = formatCodeFactory("ADIC_%c");

export const errorsDomain = new Domain();

export const ERRORS = errorsDomain.addErrorsDescriptorsMap({
	SERVICE_NOT_FOUND: ErrorDescriptor.useMessageFormatter(
		code(1),
		(name: string) => `Service "${name}" does not exist`
	),
	AMBIGUOUS_SERVICE: ErrorDescriptor.useMessageFormatter(
		code(2),
		(serviceNameList: string[], lookup: Lookup) =>
			`Multiple services found (${serviceNameList.join(", ")}) with following lookup: ${lookup}`
	),
	NO_MATCHING_SERVICE: ErrorDescriptor.useMessageFormatter(
		code(3),
		(lookup: Lookup) => `No matching service for following lookup: ${lookup}`
	),
	CIRCULAR_DEPENDENCY_DETECTED: ErrorDescriptor.useMessageFormatter(
		code(4),
		(dependencyNameList: string[]) =>
			`Circular dependency found: ${dependencyNameList.join(" -> ")}`
	),
	INCOMPLETE_DEFINITION: ErrorDescriptor.useMessageFormatter(
		code(5),
		(definitionName: string) =>
			`Missing factory for service definition "${definitionName}". Define it as constructor, factory or value`
	),
	INVALID_SERVICE_ARGUMENTS_LENGTH: ErrorDescriptor.useMessageFormatter(
		code(7),
		(name: string, requiredArgumentsLength: number, providedArgumentsLength: number) =>
			`Invalid service "${name}" definition. Required constructor arguments: ${requiredArgumentsLength}, provided: ${providedArgumentsLength}`
	),
	MISSING_INJECT_DECORATOR: ErrorDescriptor.useMessageFormatter(
		code(8),
		(position: number) =>
			`Missing @Inject decorator for argument at position "${position}". Every constructor argument needs to have @Inject decorator`
	),
	MISSING_CONFIG_VALUE: ErrorDescriptor.useMessageFormatter(
		code(9),
		(path: string) =>
			`Config at path "${path}" is not defined and default value is not provided`
	),
	ALREADY_DEFINED: ErrorDescriptor.useMessageFormatter(
		code(10),
		(name: string) => `Service "${name}" already defined`
	),
	AUTO_WIRING_FAILED: ErrorDescriptor.useMessageFormatter(
		code(11),
		(typeDescription: string) =>
			`Inferred type for ${typeDescription} is an interface, union type or built-in object that is not supported`
	),
	AUTO_WIRING_NO_METADATA: ErrorDescriptor.useDefaultMessage(
		code(12),
		'Metadata are missing. Make sure you have compiled typescript project with "emitDecoratorMetadata" option enabled'
	),
	CONFIG_PROVIDER_NOT_ATTACHED: ErrorDescriptor.useDefaultMessage(
		code(13),
		"Config provider not attached to container. You need to use config middleware first."
	),
	OWNER_CANNOT_BE_CHANGED: ErrorDescriptor.useDefaultMessage(
		code(14),
		"Owner of definition cannot be changed. Make sure you are not using same definition in multiple containers"
	),
	DEFINITION_WITHOUT_CONTAINER: ErrorDescriptor.useMessageFormatter(
		code(15),
		(name: string) => `Cannot create service "${name}" due to lack of assigned container`
	),
});
