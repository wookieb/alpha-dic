import {ServiceFactory, ServiceName} from './types';
import * as factories from './serviceFactories';
import {randomName} from './randomName';
import {TypeRef} from './TypeRef';
import {Container} from "./Container";
import * as errors from './errors';

export interface DefinitionData {
    name: ServiceName;
    annotations: any[];
    factory: ServiceFactory;
    args: any[]
    type?: TypeRef;
}

export class Definition implements DefinitionData {
    public args: any[] = [];
    public annotations: any[] = [];
    public factory!: ServiceFactory;
    public name: ServiceName;
    public type?: TypeRef;
    public owner?: Container;

    constructor(name?: ServiceName) {
        if (name) {
            this.name = name;
        } else {
            this.name = randomName();
        }
    }

    /**
     * Sets service constructor
     */
    useConstructor(constructor: { new(...args: any[]): any }): this {
        this.factory = factories.fromConstructor(constructor);
        this.type = TypeRef.createFromType(constructor);
        return this;
    }

    /**
     * Alias for {@see useConstructor}
     */
    useClass(clazz: { new(...args: any[]): any }) {
        return this.useConstructor(clazz);
    }

    /**
     * Sets factory used to create an instance of service.
     * In case of asynchronous service creation, factory should return a promise.
     *
     * The factory value is called in context of AlphaDIC.
     */
    useFactory(factory: (...args: any[]) => any | Promise<any>, type?: Function) {
        this.factory = factories.fromFactory(factory);
        this.type = type && TypeRef.createFromType(type);
        return this;
    }

    setOwner(container: Container): this {
        //tslint:disable-next-line: strict-comparisons
        if (this.owner && this.owner !== container) {
            throw errors.OWNER_CANNOT_BE_CHANGED();
        }

        this.owner = container;
        return this;
    }

    /**
     * Sets information about type of final service
     */
    markType(type: TypeRef | Function): this {
        this.type = TypeRef.is(type) ? type : TypeRef.createFromType(type);
        return this;
    }

    /**
     * Defined service as provided value
     */
    useValue(value: any) {
        this.factory = factories.fromValue(value);
        this.type = TypeRef.createFromValue(value);
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

    static create(name?: ServiceName) {
        return new Definition(name);
    }

    /**
     * Locks definitions by making it immutable
     */
    lock(): Readonly<this> {
        Object.freeze(this);
        Object.freeze(this.args);
        Object.freeze(this.annotations);
        return this;
    }

    /**
     * Returns new, locked one, object of Definition with new data
     */
    modify(data: Partial<DefinitionData>): Readonly<Definition> {
        const def = new Definition(this.name);
        Object.assign(def, this, data);
        return def.lock();
    }
}