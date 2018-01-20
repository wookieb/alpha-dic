import {create, DomainErrorDescriptor, generators} from 'alpha-errors';

const domain = create({
    codeGenerator: generators.formatCode('ADIC_%d')
});

export const SERVICE_NOT_FOUND = domain.create('Service not found');
export const AMBIGUOUS_SERVICE = domain.create('Ambiguous service');
export const NO_MATCHING_SERVICE = domain.create('No matching service');
export const CIRCULAR_DEPENDENCY_DETECTED = domain.create('Circular dependency detected');
export const INCOMPLETE_DEFINITION = domain.create('The service definition is not complete');
export const NO_SERVICE_NAME = domain.create('Missing service name');
export const INVALID_SERVICE_ARGUMENTS_LENGTH = domain.create('Invalid service arguments length');
export const MISSING_INJECT_DECORATOR = domain.create('Missing @Inject decorator');
export const MISSING_CONFIG_VALUE = domain.create('Missing config value');