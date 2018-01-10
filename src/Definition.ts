import {ServiceFactory, ServiceName} from './types';
import * as factories from './serviceFactories';

export class Definition {
    public readonly annotations: any[] = [];
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
     * Sets the array of arguments provided to service factory.
     * All arguments are provided directly to service constructor or
     * factory unless they are an instance of ContainerArg which has to be resolved first
     */
    withArgs(...args: any[]): this {
        this.args = args;
        return this;
    }

    /**
     * Adds annotation to the service
     * Annotation is a simple metadata object assigned to service that you might use for different purposes
     */
    annotate(...annotations: any[]): this {
        this.annotations.push(...annotations);
        return this;
    }

    static create(name: ServiceName) {
        return new Definition(name);
    }
}