import {ServiceName} from './types';
import {Reference} from './Reference';

export type ReferenceFunc = {
    (name: ServiceName): Reference;

    predicate: typeof Reference.one.predicate,
    annotation: typeof Reference.one.annotation,
    multi: typeof Reference.multi
};

export const reference = <ReferenceFunc>function (name: ServiceName) {
    return Reference.one.name(name);
};

reference.predicate = Reference.one.predicate;
reference.annotation = Reference.one.annotation;
reference.multi = Reference.multi;