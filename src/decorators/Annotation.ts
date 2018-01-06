import {ensureMetadata} from "./serviceMetadata";

export function Annotation(annotation: any): ClassDecorator {
    return (clazz: Function) => {
        ensureMetadata(clazz).annotations.push(annotation);
    }
}