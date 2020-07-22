import {
    AnnotationPredicate, ServiceName, DefinitionPredicate, Middleware,
    ServiceFactory
} from './types';
import {Definition} from './Definition';
import * as errors from './errors';
import {assertNoCircularDependencies} from './assertNoCircularDependencies';
import {ContainerArg} from './ContainerArg';
import * as is from 'predicates';
import {randomName} from "./randomName";

function isThenable(result: any): result is Promise<any> {
    return result && 'then' in result;
}

export class Container {
    private definitions: Map<string | Symbol, Definition> = new Map();
    private services: Map<Definition, Promise<any>> = new Map();
    private middlewares: Middleware[] = [];

    public readonly parent: Container;

    constructor(parent?: Container) {
        Object.defineProperty(this, 'parent', {
            value: parent,
            writable: false
        });
    }

    /**
     * Registers given service definition
     */
    registerDefinition(definition: Definition): this {
        if (this.definitions.has(definition.name)) {
            throw errors.ALREADY_DEFINED(`Service "${definition.name.toString()}" already defined`);
        }
        this.definitions.set(definition.name, definition);
        return this;
    }

    /**
     * Creates and registers service definition
     *
     * Returns created definition for further configuration
     */
    definition(name?: ServiceName) {
        const definition = new Definition(name);
        this.registerDefinition(definition);
        return definition;
    }

    /**
     * Creates and registers service definition with given name, function as constructor
     */
    definitionWithConstructor(name: ServiceName, clazz: Function): Definition;
    definitionWithConstructor(clazz: Function): Definition;
    definitionWithConstructor(nameOrClazz: ServiceName | Function, clazz?: Function) {
        const finalClazz: Function = is.func(nameOrClazz) ? nameOrClazz : clazz!;
        return this.definition(ServiceName.is(nameOrClazz) ? nameOrClazz : randomName(finalClazz.name))
            .useConstructor(finalClazz);
    }

    /**
     * Creates and registers service definition with given name, function as factory
     */
    definitionWithFactory(name: ServiceName, factory: ServiceFactory, type?: Function): Definition;
    definitionWithFactory(factory: ServiceFactory, type?: Function): Definition;
    definitionWithFactory(nameOrFactory: ServiceName | ServiceFactory, factoryOrType: ServiceFactory | Function, type?: Function): Definition {
        const name = ServiceName.is(nameOrFactory) ? nameOrFactory : undefined;
        const factory = is.func(nameOrFactory) ? nameOrFactory as ServiceFactory : factoryOrType as ServiceFactory;
        const finalType = is.func(nameOrFactory) ? factoryOrType : type;

        const def = this.definition(name)
            .useFactory(factory);
        if (finalType) {
            def.markType(finalType);
        }
        return def;
    }

    /**
     * Creates and registers service definition with given name and value as a service
     */
    definitionWithValue(name: ServiceName, value: any): Definition;
    definitionWithValue(value: any): Definition;
    definitionWithValue(nameOrValue: ServiceName | any, value?: any): Definition {
        const isNameProvided = value !== undefined && ServiceName.is(nameOrValue);
        const finalValue = isNameProvided ? value : nameOrValue;
        const name = isNameProvided ? nameOrValue : randomName(Object.getPrototypeOf(finalValue).constructor.name);
        return this.definition(name)
            .useValue(finalValue);
    }

    /**
     * Returns definition by given name
     */
    findByName(name: ServiceName): Definition | undefined {
        if (this.definitions.has(name)) {
            return this.definitions.get(name);
        }

        if (this.parent) {
            return this.parent.findByName(name);
        }
    }

    /**
     * Returns definitions that satisfy given predicate
     */
    findByPredicate(predicate: DefinitionPredicate): Definition[] {
        return Array.from(this.definitions.values())
            .filter(predicate)
            .concat(this.parent ? this.parent.findByPredicate(predicate) : []);
    }


    /**
     * Returns all definitions that contain annotation that satisfied given predicate
     */
    findByAnnotation(predicate: AnnotationPredicate): Definition[];
    findByAnnotation(predicate: AnnotationPredicate, withAnnotation: false): Definition[];
    findByAnnotation(predicate: AnnotationPredicate, withAnnotation: true): [Definition, any][];
    findByAnnotation(predicate: AnnotationPredicate, withAnnotation: boolean = false): Definition[] | [Definition, any][] {
        let annotations: any[] = [];
        const definitions = this.findByPredicate(s => {
            const annotation = s.annotations.find(predicate);

            if (annotation) {
                withAnnotation && annotations.push(annotation);
                return true;
            }
            return false;
        });

        if (withAnnotation) {
            return definitions.map((d): [Definition, any] => {
                return [d, annotations.shift()];
            });
        }
        return definitions;
    }

    /**
     * Registers given middleware
     */
    addMiddleware(...middlewares: Middleware[]): Container {
        this.middlewares.push(...middlewares);
        return this;
    }

    getMiddlewares(): Middleware[] {
        return this.middlewares;
    }

    /**
     * Returns service for given name or definition
     */
    get<T = any>(nameOrDefinition: ServiceName | Definition): Promise<T> {
        let definition: Definition | undefined;

        if (ServiceName.is(nameOrDefinition)) {
            definition = this.findByName(nameOrDefinition);
            if (definition === undefined) {
                return Promise.reject(errors.SERVICE_NOT_FOUND(`Service "${nameOrDefinition.toString()}" does not exist`));
            }
        } else {
            definition = nameOrDefinition;
        }

        if (this.services.has(definition)) {
            return this.services.get(definition)!;
        }

        if (!this.definitions.has(definition.name) && this.parent) {
            return this.parent.get(definition);
        }

        const promise = this.create(definition);
        this.services.set(definition, promise);
        return promise;
    }

    private create(definition: Definition) {
        if (!definition.factory) {
            return Promise.reject(
                errors.INCOMPLETE_DEFINITION(
                    `Missing factory for service definition "${definition.name.toString()}". Define it as constructor, factory or value`
                )
            );
        }

        try {
            assertNoCircularDependencies(this, definition);
        } catch (e) {
            return Promise.reject(e);
        }

        // valid definition, time to lock it
        definition.lock();

        let currentMiddleware = 0;
        const middlewares = this.getMiddlewares();
        const next = (definition: Definition) => {
            const middleware = middlewares[currentMiddleware];
            currentMiddleware++;
            if (middleware) {
                return middleware.call(this, definition, next);
            } else {
                return Promise.all(
                    definition.args.map(a => a instanceof ContainerArg ? a.getArgument(this) : a)
                )
                    .then((args: any[]) => definition.factory.apply(this, args));
            }
        };
        const result = next.call(this, definition);
        return isThenable(result) ? result : Promise.resolve(result);
    }

    /**
     * Returns all services that definition satisfies predicate
     */
    getByPredicate<T = any>(predicate: DefinitionPredicate): Promise<T[]> {
        return Promise.all(
            this.findByPredicate(predicate)
                .map(d => this.get(d))
        );
    }

    /**
     * Returns all services that definition contains annotation that satisfies given predicate
     */
    getByAnnotation<T = any>(predicate: AnnotationPredicate): Promise<T[]>;
    getByAnnotation<T = any>(predicate: AnnotationPredicate, withAnnotation: false): Promise<T[]>;
    getByAnnotation<T = any>(predicate: AnnotationPredicate, withAnnotation: true): Promise<[T, any][]>;
    getByAnnotation<T = any>(predicate: AnnotationPredicate, withAnnotation: boolean = false): Promise<T[] | [T, any][]> {
        return Promise.all(
            this.findByAnnotation(predicate, true)
                .map(async ([definition, annotation]) => {
                    if (withAnnotation) {
                        return [await this.get(definition), annotation];
                    }
                    return this.get(definition);
                })
        );
    }
}