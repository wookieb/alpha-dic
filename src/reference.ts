import {ServiceName} from './types';
import {ReferenceArg} from './args/ReferenceArg';

export interface Reference {
    (name: ServiceName): ReferenceArg;

    predicate: typeof ReferenceArg.one.predicate,
    annotation: typeof ReferenceArg.one.annotation,
    type: typeof ReferenceArg.one.type,
    multi: typeof ReferenceArg.multi
}

export const reference = function (name: ServiceName) {
    return ReferenceArg.one.name(name);
} as Reference;

reference.predicate = ReferenceArg.one.predicate;
reference.annotation = ReferenceArg.one.annotation;
reference.type = ReferenceArg.one.type;
reference.multi = ReferenceArg.multi;