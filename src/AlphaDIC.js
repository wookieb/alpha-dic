'use strict';

const Service = require('./Service');
const match = require('lodash._basematches');

/**
 * @namespace AlphaDIC
 */

/**
 * @typedef {Function} ServicePredicate
 * @param {Service} service
 * @returns {boolean}
 */

/**
 * Gets instance of service with given anme
 *
 * @param {string} serviceName
 * @param {Array<string>} parents list of service parents - user for cycle dependency detection
 * @returns {Promise<*>}
 */
const getService = function (serviceName, parents) {
    const service = this.services[serviceName];
    if (!service) {
        return Promise.reject(new Error(`Undefined service ${serviceName}`));
    }

    if (service.cacheable) {
        if (this.instances[service.name]) {
            return Promise.resolve(this.instances[service.name]);
        }

        if (this.currentlyResolving[service.name]) {
            return this.currentlyResolving[service.name];
        }
    }

    const promise = constructService.call(this, service, parents)
        .then((instance) => {
            if (service.cacheable) {
                this.instances[service.name] = instance;
                delete this.currentlyResolving[service.name];
            }
            return instance;
        });

    if (service.cacheable) {
        this.currentlyResolving[service.name] = promise;
    }
    return promise;
};

/**
 * Creates a service
 * @param {Service} service
 * @param {Array<string>} parents list of service parents - user for cycle dependency detection
 * @returns {Promise<*>}
 */
const constructService = function (service, parents) {
    if (parents.indexOf(service.name) !== -1) {
        return Promise.reject(
            new Error(`Cycle dependency detected for service ${service.name} - parents: ${parents.join(', ')}`)
        );
    }

    const promisifiedDependencies = service.dependencies.map(
        (s) => {
            return getService.call(this, s, parents.concat([service.name]));
        }
    );
    return Promise.all(promisifiedDependencies)
        .then((dependencies) => {
            switch (service.type) {
                case Service.TYPE_CONSTRUCTOR:
                    return new (Function.prototype.bind.apply(service.value, [null].concat(dependencies)));
                    break;

                case Service.TYPE_VALUE:
                    return Promise.resolve(service.value);
                    break;

                case Service.TYPE_FACTORY:
                    return service.value.apply(this, dependencies);
                    break;

                case Service.TYPE_ASYNC_FACTORY:
                    return new Promise((resolve, reject) => {
                        const callback = (err, service) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            resolve(service);
                        };
                        service.value.apply(this, dependencies.concat([callback]));
                    });
                    break;
            }

            throw new Error(`No constructor or factory defined for service ${service.name}`);
        });
};

const useCallback = function (promise, callback) {
    if (callback && callback instanceof Function) {
        promise.then(
            (result) => {
                callback.call(this, null, result);
            },
            (err) => {
                callback.call(this, err);
            }
        );
    }
    return promise;
};

class AlphaDIC {
    constructor() {
        this.services = Object.create(null);
        this.instances = Object.create(null);

        // Set of promises for services that are currently being resolved
        this.currentlyResolving = Object.create(null);
    }

    /**
     * Returns instance of service for given name or Service object
     *
     * @param {(Service|string)} nameOrService or instance of Service
     * @param {Function} [callback]
     * @returns {Promise<*>}
     */
    get(nameOrService, callback) {
        const name = typeof nameOrService === 'string' ? nameOrService : nameOrService.name;
        return useCallback.call(this, getService.call(this, name, []), callback);
    }

    /**
     * Returns instances of services of given names or Service objects
     *
     * @param {Array<(Service|string)>} namesOrServices
     * @param {Function} [callback]
     * @returns {Promise<Array<*>>}
     */
    getMany(namesOrServices, callback) {
        return useCallback.call(this, Promise.all(
            namesOrServices.map(this.get.bind(this))
        ), callback);
    }

    has(nameOrService) {
        const name = typeof nameOrService === 'string' ? nameOrService : nameOrService.name;
        return !!this.services[name];
    }

    /**
     * Returns instances of services that match given predicate
     *
     * @param {ServicePredicate} predicate has to return true for matching services
     * @param {Function} [callback]
     * @returns {Promise<Array<*>>}
     */
    getByPredicate(predicate, callback) {
        return useCallback.call(this, new Promise((resolve, reject) => {
            const promises = this.findByPredicate(predicate)
                .map(service => getService.call(this, service.name, []));

            Promise.all(promises).then(resolve, reject);
        }), callback);
    }

    /**
     * Returns instances of services with annotation of given name
     * NOTE! This method is intended to be use for super simple aggregations.
     * For advanced ones (that requires access to annotation properties or others) use "findByAnnotation" or "findByPredicate"
     *
     * @see {@link findByAnnotation}
     * @see {@link findByPredicate}
     *
     * @param {string} annotationName
     * @param {Function} [callback]
     * @returns {Promise<Array<*>>}
     */
    getByAnnotationName(annotationName, callback) {
        return this.getByPredicate((service) => {
            return service.hasAnnotation(annotationName);
        }, callback);
    }

    /**
     * Returns services definitions that satisfies given predicate
     *
     * @param {ServicePredicate} predicate
     * @return {Array<Service>}
     */
    findByPredicate(predicate) {
        return Object.keys(this.services)
            .map(serviceKey => this.services[serviceKey])
            .filter(predicate);
    }

    /**
     * @typedef {Function} PropertiesPredicate
     * @param {Object} properties
     * @returns {boolean}
     */

    /**
     * @typedef {Function} AnnotationNamePredicate
     * @param {string} annotationName
     * @returns {boolean}
     */

    /**
     * Returns service definitions that match given criteria.
     * When "properties" object provided then performs annotation properties comparison using lodash._basematches
     * which is basically the same as https://lodash.com/docs#matches but it doesn't clone the source object.
     *
     * @param {(AnnotationNamePredicate|string)} annotationName
     * @param {(PropertiesPredicate|Object)} [properties]
     */
    findByAnnotation(annotationName, properties) {
        const namePredicate = (annotationName instanceof Function) ? annotationName : name => name === annotationName;
        let propertiesPredicate = (x) => true;

        if (properties instanceof Function) {
            propertiesPredicate = properties;
        } else if (typeof properties === 'object') {
            propertiesPredicate = match(properties);
        }

        return this.findByPredicate((service) => {
            return Object.keys(service.getAnnotations())
                .some(annotationName => {
                    return namePredicate(annotationName) &&
                        propertiesPredicate(service.getAnnotation(annotationName));
                });
        });
    }

    /**
     * Defines and registers service with given name
     * Returns Service instance for further configuration
     *
     * @param {string} name
     * @returns {Service}
     */
    service(name) {
        const service = new Service(name);
        this.services[service.name] = service;
        return service;
    }

    /**
     * Defines and registers service with given name and provided value as constructor
     * Returns Service instance for further configuration
     *
     * @param {string} name
     * @param {Function} constructorFunction
     * @param {Array<string>} [dependencies=[]]
     * @returns {Service}
     */
    serviceAsConstructor(name, constructorFunction, dependencies) {
        return this.service(name)
            .useConstructor(constructorFunction)
            .dependsOn(dependencies || []);
    }

    /**
     * Defines and registers service with given name and provided value as factory
     * Returns Service instance for further configuration
     *
     * @param {string} name
     * @param {Function} factoryFunction
     * @param {Array<string>} [dependencies=[]]
     * @returns {Service}
     */
    serviceAsFactory(name, factoryFunction, dependencies) {
        return this.service(name)
            .useFactory(factoryFunction)
            .dependsOn(dependencies || []);
    }

    /**
     * Defines and registers service with given name and provided value as async factory
     * Returns Service instance for further configuration
     *
     * @param {string} name
     * @param {Function} asyncFactoryFunction
     * @param {Array<string>} [dependencies=[]]
     * @returns {Service}
     */
    serviceAsAsyncFactory(name, asyncFactoryFunction, dependencies) {
        return this.service(name)
            .useAsyncFactory(asyncFactoryFunction)
            .dependsOn(dependencies || []);
    }

    /**
     * Defines and registers service with given and provided value as a value for the service.
     * Returns Service instance for further configuration.
     *
     * @param {string} name
     * @param {*} value
     * @param {Array<string>} [dependencies=[]]
     * @returns {Service}
     */
    serviceAsValue(name, value, dependencies) {
        return this.service(name)
            .useValue(value)
            .dependsOn(dependencies || []);
    }

    /**
     * Returns all definitions of services
     *
     * @return {Object}
     */
    getServicesDefinitions() {
        return this.services
    }

    /**
     * @param {string} name
     * @returns {Service}
     */
    getServiceDefinition(name) {
        return this.services[name];
    }
}

module.exports = AlphaDIC;