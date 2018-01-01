import {
    AnnotationName, AnnotationPredicate, ServiceName, DefinitionPredicate, Middleware,
    ServiceFactory
} from './types';
import {Definition} from './Definition';
import {isStringOrSymbol} from './helpers';
import * as errors from './errors';
import {assertNoCircularDependencies} from './assertNoCircularDependencies';
import {ContainerArg} from './ContainerArg';

function isThenable(result: any): result is Promise<any> {
    return result && 'then' in result;
}

export class Container {
    private definitions: Map<string | Symbol, Definition> = new Map();
    private services: Map<Definition, Promise<any>> = new Map();

    private middlewares: Middleware[] = [];

    /**
     * Registers given service definition
     */
    registerDefinition(definition: Definition): this {
        this.definitions.set(definition.name, definition);
        return this;
    }

    /**
     * Creates and registers service definition
     *
     * Returns created definition for further configuration
     */
    definition(name: ServiceName) {
        const definition = new Definition(name);
        this.registerDefinition(definition);
        return definition;
    }

    /**
     * Creates and registers service definition with given name, function as constructor
     */
    definitionAsConstructor(name: ServiceName, clazz: Function) {
        return this.definition(name)
            .useConstructor(clazz);
    }

    /**
     * Creates and registers service definition with given name, function as factory
     */
    definitionAsFactory(name: ServiceName, factory: ServiceFactory) {
        return this.definition(name)
            .useFactory(factory);
    }

    /**
     * Creates and registers service definition with given name and service value
     */
    definitionAsValue(name: ServiceName, value: any) {
        return this.definition(name)
            .useValue(value);
    }

    findByPredicate(predicate: DefinitionPredicate) {
        return Array.from(this.definitions.values())
            .filter(predicate);
    }

    findByName(name: ServiceName) {
        return this.definitions.get(name);
    }

    findByAnnotation(name: AnnotationName) {
        return this.findByPredicate(d => d.hasAnnotation(name));
    }

    findByAnnotationPredicate(predicate: AnnotationPredicate) {
        return this.findByPredicate((service => {
            return Array.from(service.annotations.values())
                .some(predicate);
        }));
    }

    /**
     * Registers given middleware
     */
    addMiddleware(...middlewares: Middleware[]): Container {
        this.middlewares.push(...middlewares);
        return this;
    }

    get <T = any>(nameOrDefinition: ServiceName | Definition): Promise<T> {
        let definition: Definition;

        if (isStringOrSymbol(nameOrDefinition)) {
            definition = this.findByName(nameOrDefinition);
            if (!definition) {
                return Promise.reject(errors.SERVICE_NOT_FOUND(`Service '${nameOrDefinition}' does not exist`));
            }
        } else {
            definition = nameOrDefinition;
        }

        if (this.services.has(definition)) {
            return this.services.get(definition);
        }

        const promise = this.create(definition);
        this.services.set(definition, promise);
        return promise;
    }

    private create(definition: Definition) {

        if (!definition.factory) {
            return Promise.reject(
                errors.INCOMPLETE_DEFINITION(
                    `Missing factory for service definition '${definition.name}'. Define it as constructor, factory or value`
                )
            );
        }

        try {
            assertNoCircularDependencies(this, definition);
        } catch (e) {
            return Promise.reject(e);
        }


        let currentMiddleware = 0;
        const next = (definition: Definition) => {
            const middleware = this.middlewares[currentMiddleware];
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
     * Returns all services that definitions matches predicate
     */
    getByPredicate(predicate: DefinitionPredicate): Promise<any[]> {
        return Promise.all(
            this.findByPredicate(predicate)
                .map(d => this.get(d))
        );
    }

    /**
     * Returns all services that definition contains annotation with given name
     */
    getByAnnotation(name: AnnotationName) {
        return Promise.all(
            this.findByAnnotation(name)
                .map(d => this.get(d))
        );
    }

    /**
     * Returns all services that definition contains annotation that satisfies given predicate
     */
    getByAnnotationPredicate(predicate: AnnotationPredicate) {
        return Promise.all(
            this.findByAnnotationPredicate(predicate)
                .map(d => this.get(d))
        );
    }
}