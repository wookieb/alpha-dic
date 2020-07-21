import {Definition} from "../Definition";

export const deprecatedAnnotationName = '__deprecatedService';

export function deprecated(note: string) {
    return {
        name: deprecatedAnnotationName,
        note
    }
}

export type DeprecationMessageFunc = (message: string) => void;

export function deprecatedMiddleware(messageFunc: DeprecationMessageFunc = console.warn) {
    return (definition: Definition, next: Function) => {
        const deprecatedAnnotations = definition.annotations
            .filter(d => d && d.name === deprecatedAnnotationName);

        if (deprecatedAnnotations.length) {
            const deprecationNote = deprecatedAnnotations.map(d => d.note).join(', ');
            messageFunc(`Service ${definition.name.toString()} is deprecated: ` + deprecationNote)
        }

        return next(definition);
    }
}