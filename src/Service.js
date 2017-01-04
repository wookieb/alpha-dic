'use strict';
/**
 * @namespace AlphaDIC
 */

/**
 * @class
 */
class Service {
    constructor(name) {
        /**
         * @member {string}
         */
        this.name = name;
        /**
         * @type {boolean}
         */
        this.cacheable = true;
        /**
         * @type {Object}
         */
        this.annotations = Object.create(null);
        /**
         * @type {Array<string>}
         */
        this.dependencies = [];
    }

    /**
     * Makes service non cacheable which means it will be created every time
     */
    nonCacheable() {
        this.cacheable = false;
    }

    /**
     * Sets constructor value used to create instance of service.
     *
     * @param {Function} constructorFunction
     * @returns {Service}
     */
    useConstructor(constructorFunction) {
        this.type = Service.TYPE_CONSTRUCTOR;
        this.value = constructorFunction;
        return this;
    }

    /**
     * Sets factory value used to create instance of service.
     * The value should return promise in case of asynchronous service creation.
     * The factory value is called in context of AlphaDIC.
     *
     * @param {Function} factoryFunction
     * @returns {Service}
     */
    useFactory(factoryFunction) {
        this.type = Service.TYPE_FACTORY;
        this.value = factoryFunction;
        return this;
    }

    /**
     * Sets given argument as a value for the service.
     * The service will be always resolved to given value.
     *
     *
     * @param {*} value
     * @returns {Service}
     */
    useValue(value) {
        this.type = Service.TYPE_VALUE;
        this.value = value;
        return this;
    }

    /**
     * Sets asynchronous factory value used to create instance of service.
     * The value should call callback provided as last argument to the value (after dependencies)
     * The factory value is called in context of AlphaDIC.
     *
     * @example
     * const service = new Service('service')
     * service.useAsyncFactory((A, callback) => {
     *      setTimeout(() => {
     *          callback(null, {A: A, some: 'property'});
     *      }, 100);
     * });
     *
     * @param {Function} factoryFunction
     * @returns {Service}
     */
    useAsyncFactory(factoryFunction) {
        this.type = Service.TYPE_ASYNC_FACTORY;
        this.value = factoryFunction;
        return this;
    }

    /**
     * Defines dependencies that will be resolved and then injected to the service.
     *
     * @param {(string|Array<string>|...string)} services
     */
    dependsOn(services) {
        if (Array.isArray(services)) {
            this.dependencies = services;
        } else {
            this.dependencies = Array.from(arguments);
        }
        return this;
    }

    /**
     * @typedef {Object} Annotation
     * @property {string} name
     */

    /**
     * Sets annotation with given name and properties
     *
     * @param {(Annotation|string)} name
     * @param {Object} [properties={}]
     * @returns {Service}
     */
    annotate(name, properties) {
        if (!name) {
            throw new Error('Annotation name has to be string or annotation object');
        }

        if (typeof name === 'string') {
            this.annotations[name] = properties || {};
        } else {
            if (!name.name) {
                throw new Error('Annotation object requires non-empty "name" property');
            }
            this.annotations[name.name] = name;
        }
        return this;
    }

    /**
     * Checks whether given annotation exists
     *
     * @param {string} name
     * @returns {boolean}
     */
    hasAnnotation(name) {
        return name in this.annotations;
    }

    /**
     * Returns properties for given annotation
     *
     * @param {string} name
     * @returns {Object}
     */
    getAnnotation(name) {
        return this.annotations[name];
    }

    /**
     * Returns all annotations
     *
     * @returns {Object}
     */
    getAnnotations() {
        return this.annotations;
    }
}

Service.TYPE_CONSTRUCTOR = 'constructor';
Service.TYPE_FACTORY = 'factory';
Service.TYPE_ASYNC_FACTORY = 'async-factory';
Service.TYPE_VALUE = 'value';

module.exports = Service;