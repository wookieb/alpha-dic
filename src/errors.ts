import {create, DomainErrorDescriptor} from 'alpha-errors';

const domain = create();

export const SERVICE_NOT_FOUND = domain.create('Service not found', 'ADIC_01');
export const AMBIGUOUS_SERVICE = domain.create('Ambiguous service', 'ADIC_02');
export const NO_MATCHING_SERVICE = domain.create('No matching service', 'ADIC_03');
export const CIRCULAR_DEPENDENCY_DETECTED = domain.create('Circular dependency detected', 'ADIC_04');
export const INCOMPLETE_DEFINITION = domain.create('The service definition is not complete', 'ADIC_05');
export const NO_SERVICE_NAME = domain.create('Missing service name', 'ADIC_06');
export const INVALID_SERVICE_ARGUMENTS_LENGTH = domain.create('Invalid service arguments length', 'ADIC_07');
export const MISSING_INJECT_DECORATOR = domain.create('Missing @Inject decorator', 'ADIC_08');