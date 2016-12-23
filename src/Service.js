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
         *
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
     * Sets constructor function used to create instance of service.
     *
     * @param {Function} constructorFunction
     * @returns {Service}
     */
    useConstructor(constructorFunction) {
        this.type = Service.TYPE_CONSTRUCTOR;
        this.function = constructorFunction;
        return this;
    }
    
    /**
     * Sets factory function used to create instance of service.
     * The function should return promise in case of asynchronous service creation.
     * The factory function is called in context of AlphaDIC.
     *
     * @param {Function} factoryFunction
     * @returns {Service}
     */
    useFactory(factoryFunction) {
        this.type = Service.TYPE_FACTORY;
        this.function = factoryFunction;
        return this;
    }
    
    /**
     * Sets asynchronous factory function used to create instance of service.
     * The function should call callback provided as last argument to the function (after dependencies)
     * The factory function is called in context of AlphaDIC.
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
        this.function = factoryFunction;
        return this;
    }
    
    /**
     * @param {(Array<string>|...string)} services
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
     * Sets annotation with given name and properties
     *
     * @param {string} name
     * @param {Object} [properties={}]
     * @returns {Service}
     */
    annotate(name, properties) {
        this.annotations[name] = properties || {};
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
}

Service.TYPE_CONSTRUCTOR = 'constructor';
Service.TYPE_FACTORY = 'factory';
Service.TYPE_ASYNC_FACTORY = 'async-factory';

module.exports = Service;