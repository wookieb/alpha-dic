export interface Annotation {
    name: string;
    [extraProperty: string]: any
}

enum ServiceCreationType {
    CONSTRUCTOR,
    FACTORY,
    VALUE
}

export class Service {
    public cacheable = true;
    public annotations = new Map<string, Annotation>();
    public dependencies: string[] = [];

    private creationType: ServiceCreationType;
    private creator: () => Promise<any>;

    constructor(public readonly name: string) {

    }

    /**
     * Makes service non cacheable which means it will be created every time
     *
     * @returns {Service}
     */
    nonCacheable(): this {
        this.cacheable = false;
        return this;
    }

    /**
     * Sets constructor of service to use when creating an instance of it
     */
    useConstructor(func: Function): this {
        this.creationType = ServiceCreationType.CONSTRUCTOR;
        this.creator = func;
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
     * In case of asynchronours service creation, factory should return a promise.
     * The factory value is called in context of AlphaDIC.
     */
    useFactory(factory: () => any | Promise<any>) {
        this.creationType = ServiceCreationType.FACTORY;
        this.creator = factory;
        return this;
    }

    useValue(value) {
        this.creationType = ServiceCreationType.VALUE;
        this.creator = value;
        return this;
    }

    /**
     * Adds annotation to the service
     * Annotation is a simple metadata object assigned to service that you might use for different purposes
     */
    annotate(name: string): this;
    annotate(name: string, properties: object): this;
    annotate(annotation: Annotation): this;
    annotate(nameOrAnnotation: string | Annotation, properties?: object): this {
        if (!nameOrAnnotation) {
            throw new Error('Annotation name has to be string or annotation object');
        }

        let annotation: Annotation;
        if (typeof nameOrAnnotation === 'string') {
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

    /**
     * Dependencies to inject to the service
     */
    dependsOn(services: string[]);
    dependsOn(...services: string[]);
    dependsOn(services: string[] | string, ...extraServices: string[]) {
        if (Array.isArray(services)) {
            this.dependencies = services;
        } else {
            this.dependencies = (<string[]>services).concat(extraServices);
        }
        return this;
    }
}