import {create, DomainErrorDescriptor} from 'alpha-errors';

const domain = create();

export const SERVICE_NOT_FOUND = domain.create('Service not found', 'ADIC_01');
export const AMBIGUOUS_SERVICE = domain.create('Ambiguous service', 'ADIC_02');
export const NO_MATCHING_SERVICE = domain.create('Ambiguous service', 'ADIC_03');
export const CIRCULAR_DEPENDENCY_DETECTED = domain.create('Circular dependency detected', 'ADIC_04');
export const INCOMPLETE_DEFINITION = domain.create('The service definition is not complete', 'ADIC_05');