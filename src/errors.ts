import {create, generators} from 'alpha-errors';

const domain = create({
    codeGenerator: generators.formatCode('ADIC_%d')
});

export const SERVICE_NOT_FOUND = domain.create('Service not found', '1');
export const AMBIGUOUS_SERVICE = domain.create('Ambiguous service', '2');
export const NO_MATCHING_SERVICE = domain.create('No matching service', '3');
export const CIRCULAR_DEPENDENCY_DETECTED = domain.create('Circular dependency detected', '4');
export const INCOMPLETE_DEFINITION = domain.create('The service definition is not complete', '5');
// Number 6 is missing due to removed requirement for service to have a name
export const INVALID_SERVICE_ARGUMENTS_LENGTH = domain.create('Invalid service arguments length', '7');
export const MISSING_INJECT_DECORATOR = domain.create('Missing @Inject decorator', '8');
export const MISSING_CONFIG_VALUE = domain.create('Missing config value', '9');
export const ALREADY_DEFINED = domain.create('Service with given name already defined', '10');
export const AUTOWIRING_FAILED = domain.create('Inferred type for %s is an interface, union type or built-in object that is not supported', '11');
export const AUTOWIRING_NO_METADATA = domain.create('Metadata are missing. Make sure you have compiled typescript project with "emitDecoratorMetadata" option enabled', '12');
export const CONFIG_PROVIDER_NOT_ATTACHED = domain.create('Config provider not attached to container. You need to use config middleware first.');
export const OWNER_CANNOT_BE_CHANGED = domain.create('Owner of definition cannot be changed. Make sure you are not using same definition in multiple containers');
export const DEFINITION_WITHOUT_CONTAINER = domain.create('Cannot create service due to lack of assigned container');