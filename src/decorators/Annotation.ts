import {ensureMetadata} from "./serviceMetadata";
import {getDefinitionForClass} from "./Service";

export function Annotation(annotation: any): ClassDecorator {
    return (clazz: Function) => {
        const definition = getDefinitionForClass(clazz);
        if (definition) {
            definition.annotate(annotation);
        }
        ensureMetadata(clazz).annotations.push(annotation);
    }
}