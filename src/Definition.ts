import {Annotation, AnnotationName, ServiceFactory, ServiceName} from "./types";
import * as factories from './serviceFactories';
import {isStringOrSymbol} from "./helpers";

export class Definition {
    public readonly annotations: Map<AnnotationName, Annotation> = new Map();
    public factory: ServiceFactory;
    public args: any[] = [];

    constructor(public readonly name: ServiceName) {
        Object.defineProperty(this, 'annotations', {
            writable: false
        });
    }

    /**
     * Sets service constructor
     */
    useConstructor(constructor: Function): this {
        this.factory = factories.fromConstructor(constructor);
        return this;
    }

    /**
     * Alias for {@see useConstructor}
     */
    useClass(clazz: Function) {
        return this.useConstructor(clazz);
    }

    /**
     * Sets factory used to create an instance of service.
     * In case of asynchronous service creation, factory should return a promise.
     *
     * The factory value is called in context of AlphaDIC.
     */
    useFactory(factory: (...args: any[]) => any | Promise<any>) {
        this.factory = factories.fromFactory(factory);
        return this;
    }

    /**
     * Defined service as provided value
     */
    useValue(value: any) {
        this.factory = factories.fromValue(value);
        return this;
    }

    /**
     * Sets the array of arguments provided to service factory
     */
    withArgs(...args: any[]): this {
        this.args = args;
        return this;
    }

    /**
     * Adds annotation to the service
     * Annotation is a simple metadata object assigned to service that you might use for different purposes
     */
    annotate(name: AnnotationName): this;
    annotate(name: AnnotationName, properties: object): this;
    annotate(annotation: Annotation): this;
    annotate(nameOrAnnotation: AnnotationName | Annotation, properties?: object): this {
        if (!nameOrAnnotation) {
            throw new Error('Annotation name has to be a non-empty string or annotation object');
        }

        let annotation: Annotation;
        if (isStringOrSymbol(nameOrAnnotation)) {
            annotation = Object.assign({}, properties, {name: nameOrAnnotation});
        } else {
            if (!nameOrAnnotation.name) {
                throw new Error('Annotation object requires non-empty "name" property');
            }
            annotation = nameOrAnnotation;
        }
        this.annotations.set(annotation.name, annotation);
        return this;
    }

    hasAnnotation(name: AnnotationName) {
        return this.annotations.has(name);
    }

    getAnnotation(name: AnnotationName) {
        return this.annotations.get(name);
    }

    static create(name: ServiceName) {
        return new Definition(name);
    }
}