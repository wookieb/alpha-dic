'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');

const AlphaDIC = require('../src/AlphaDIC');
const Service = require('../src/Service');

describe('AlphaDIC', () => {
    let dic;

    beforeEach(() => {
        dic = new AlphaDIC;
    });

    describe('getting simple service', () => {
        const serviceObject = {some: 'service'};
        let dic;
        beforeEach(() => {
            dic = new AlphaDIC;
            dic.service('test')
                .useFactory(() => {
                    return serviceObject;
                });
        });

        it('via promise', (done) => {
            dic.get('test')
                .then((service) => {
                    assert.strictEqual(service, serviceObject);
                })
                .then(done, done);
        });

        it('via callback', (done) => {
            dic.get('test', (err, service) => {
                try {
                    assert.notOk(err);
                    assert.strictEqual(service, serviceObject);
                } catch (e) {
                    return done(e);
                }
                done(err);
            });
        });
    });

    describe('getting many services', () => {
        let dic, serviceA, serviceB, serviceC;

        const serviceObjectA = {service: 'A'};
        const serviceObjectB = {service: 'B'};
        const serviceObjectC = {service: 'C'};

        beforeEach(() => {
            dic = new AlphaDIC;
            serviceA = dic.serviceAsAsyncFactory('A', (callback) => {
                setTimeout(() => callback(null, serviceObjectA), 50);
            });

            serviceB = dic.serviceAsFactory('B', (C) => {
                return serviceObjectB;
            })
                .dependsOn('C');

            serviceC = dic.serviceAsValue('C', serviceObjectC);
        });

        describe('preserves the order of services', () => {
            it('via promise', (done) => {
                dic.getMany(['C', 'A'])
                    .then((services) => {
                        assert.deepEqual(services, [serviceObjectC, serviceObjectA]);
                    })
                    .then(done, done);
            });

            it('via callback', (done) => {
                dic.getMany(['C', 'A'], (err, services) => {
                    try {
                        assert.notOk(err);
                        assert.deepEqual(services, [serviceObjectC, serviceObjectA]);
                    } catch (e) {
                        return done(e)
                    }
                    done();
                });
            });

            it('even if dependencies are resolved first', (done) => {
                dic.getMany(['B', 'C'])
                    .then((services) => {
                        assert.deepEqual(services, [serviceObjectB, serviceObjectC]);
                    })
                    .then(done, done);
            });
        });

        it('works for names and service objects', (done) => {
            dic.getMany(['A', serviceB, serviceC])
                .then((services) => {
                    assert.deepEqual(services, [serviceObjectA, serviceObjectB, serviceObjectC]);
                })
                .then(done, done);
        });
    });

    it('getting service by service instance', (done) => {
        const serviceObject = {some: 'object'};
        const service = dic.serviceAsValue('A', serviceObject);

        dic.get(service)
            .then((service) => {
                assert.strictEqual(service, serviceObject);
            })
            .then(done, done);
    });

    it('"has" return true for defined services and false for undefined', () => {
        dic.service('test');

        assert.ok(dic.has('test'));
        assert.notOk(dic.has('test2'));
    });

    describe('getting simple service', () => {
        let factory, service, dic;
        const serviceObject = {some: 'serviceObject'};
        beforeEach(() => {
            dic = new AlphaDIC;
            factory = sinon.stub();

            service = dic.service('test');
        });

        it('defined as constructor', (done) => {
            service.useConstructor(function () {
                this.newProperty = 'it is new';
            });

            dic.get('test')
                .then((service) => {
                    assert.deepEqual(service, {newProperty: 'it is new'});
                })
                .then(done, done);
        });

        it('defined as factory', (done) => {
            factory.returns(serviceObject);
            service.useFactory(factory);

            dic.get('test')
                .then((service) => {
                    sinon.assert.calledOn(factory, dic);
                    assert.strictEqual(service, serviceObject);
                })
                .then(done, done);
        });

        it('defined as factory returning promise', (done) => {
            factory.returns(Promise.resolve(serviceObject));
            service.useFactory(factory);

            dic.get('test')
                .then((service) => {
                    sinon.assert.calledOn(factory, dic);
                    assert.strictEqual(service, serviceObject);
                })
                .then(done, done);
        });

        it('defined as async factory', (done) => {
            factory.yields(null, serviceObject);
            service.useAsyncFactory(factory);

            dic.get('test')
                .then((service) => {
                    sinon.assert.calledOn(factory, dic);
                    assert.strictEqual(service, serviceObject);
                })
                .then(done, done);
        });
    });


    it('returns an error for cycle dependencies', (done) => {
        const factory = sinon.stub();

        dic.service('A')
            .useFactory(factory)
            .dependsOn('B');

        dic.service('B')
            .useFactory(factory)
            .dependsOn('C');

        dic.service('C')
            .useFactory(factory)
            .dependsOn('A');

        dic.get('A')
            .then((service) => {
                throw new Error('Getting "A" service should not be successful');
            }, (e) => {
                assert.strictEqual(e.message, 'Cycle dependency detected for service A - parents: A, B, C');
            })
            .then(done, done);
    });

    describe('getting service with dependencies', () => {
        let factoryA, factoryB, serviceA, serviceB, dic;
        const serviceObjectA = {service: 'A'};
        const serviceObjectB = {service: 'B'};

        beforeEach(() => {
            dic = new AlphaDIC;

            factoryA = sinon.stub();
            factoryB = sinon.stub();

            serviceA = dic.service('A')
                .useFactory(factoryA)
                .dependsOn('B');

            serviceB = dic.service('B')
                .useFactory(factoryB);

            factoryB.returns(serviceObjectB);
        });

        afterEach(() => {
            sinon.assert.calledOn(factoryB, dic);
        });

        it('defined as constructor', (done) => {
            serviceA.useConstructor(function (B) {
                assert.strictEqual(B, serviceObjectB);
                this.newProperty = 'it is new';
            });

            dic.get('A')
                .then((service) => {
                    assert.deepEqual(service, {newProperty: 'it is new'});
                    done();
                })
                .catch(done);
        });

        it('defined as factory', (done) => {
            factoryA.returns(serviceObjectA);
            serviceA.useFactory(factoryA);

            dic.get('A')
                .then((service) => {
                    sinon.assert.calledOn(factoryA, dic);
                    sinon.assert.calledWithExactly(factoryA, serviceObjectB);
                    assert.strictEqual(service, serviceObjectA);
                    done();
                })
                .catch(done);
        });

        it('defined as factory returning promise', (done) => {
            factoryA.returns(Promise.resolve(serviceObjectA));
            serviceA.useFactory(factoryA);

            dic.get('A')
                .then((service) => {
                    sinon.assert.calledOn(factoryA, dic);
                    sinon.assert.calledWith(factoryA, serviceObjectB);
                    assert.strictEqual(service, serviceObjectA);
                    done();
                })
                .catch(done);
        });

        it('defined as async factory', (done) => {
            factoryA.yields(null, serviceObjectA);
            serviceA.useAsyncFactory(factoryA);

            dic.get('A')
                .then((service) => {
                    sinon.assert.calledOn(factoryA, dic);
                    sinon.assert.calledWith(factoryA, serviceObjectB);
                    assert.strictEqual(service, serviceObjectA);
                    done();
                })
                .catch(done);
        });

    });

    describe('getting service with complex dependencies', () => {
        let serviceA, serviceB, serviceC, serviceD;
        let factoryA, factoryB, factoryC, factoryD;
        let dic;
        let serviceObjectA = {service: 'A'};
        let serviceObjectB = {service: 'B'};
        let serviceObjectC = {service: 'C'};
        let serviceObjectD = {service: 'D'};

        beforeEach(() => {
            dic = new AlphaDIC;
            factoryA = sinon.stub();
            factoryB = sinon.stub();
            factoryC = sinon.stub();
            factoryD = sinon.stub();

            serviceA = dic.service('A')
                .useFactory(factoryA)
                .dependsOn('B');

            serviceB = dic.service('B')
                .useFactory(factoryB)
                .dependsOn('C', 'D');

            serviceC = dic.service('C')
                .useFactory(factoryC);

            serviceD = dic.service('D')
                .useFactory(factoryD);

            factoryB.returns(serviceObjectB);
            factoryC.returns(serviceObjectC);
            factoryD.returns(serviceObjectD);
        });

        afterEach(() => {
            sinon.assert.calledOn(factoryB, dic);
            sinon.assert.calledWith(factoryB, serviceObjectC, serviceObjectD);
            sinon.assert.calledOn(factoryC, dic);
            sinon.assert.calledOn(factoryD, dic);
        });

        it('defined as constructor', (done) => {
            serviceA.useConstructor(function (B) {
                assert.strictEqual(B, serviceObjectB);
                this.newProperty = 'it is new';
            });

            dic.get('A')
                .then((service) => {
                    assert.deepEqual(service, {newProperty: 'it is new'});
                    done();
                })
                .catch(done);
        });

        it('defined as factory', (done) => {
            factoryA.returns(serviceObjectA);
            serviceA.useFactory(factoryA);

            dic.get('A')
                .then((service) => {
                    sinon.assert.calledOn(factoryA, dic);
                    sinon.assert.calledWithExactly(factoryA, serviceObjectB);
                    assert.strictEqual(service, serviceObjectA);
                    done();
                })
                .catch(done);
        });

        it('defined as factory returning promise', (done) => {
            factoryA.returns(Promise.resolve(serviceObjectA));
            serviceA.useFactory(factoryA);

            dic.get('A')
                .then((service) => {
                    sinon.assert.calledOn(factoryA, dic);
                    sinon.assert.calledWith(factoryA, serviceObjectB);
                    assert.strictEqual(service, serviceObjectA);
                    done();
                })
                .catch(done);
        });

        it('defined as async factory', (done) => {
            factoryA.yields(null, serviceObjectA);
            serviceA.useAsyncFactory(factoryA);

            dic.get('A')
                .then((service) => {
                    sinon.assert.calledOn(factoryA, dic);
                    sinon.assert.calledWith(factoryA, serviceObjectB);
                    assert.strictEqual(service, serviceObjectA);
                    done();
                })
                .catch(done);
        });

    });

    describe('defining service', () => {

        it('simple one', () => {
            const service = dic.service('simple');

            assert.deepEqual(service, (new Service('simple')))
        });

        it('as constructor', () => {
            const constructorFunction = sinon.spy();
            const service = dic.serviceAsConstructor('constructor', constructorFunction);
            assert.deepEqual(
                service,
                (new Service('constructor'))
                    .useConstructor(constructorFunction)
            )
        });

        it('as constructor with dependencies', () => {
            const constructorFunction = sinon.spy();
            const service = dic.serviceAsConstructor('constructor', constructorFunction, ['A', 'B']);
            assert.deepEqual(
                service,
                (new Service('constructor'))
                    .useConstructor(constructorFunction)
                    .dependsOn('A', 'B')
            )
        });

        it('as factory', () => {
            const factory = sinon.stub();
            const service = dic.serviceAsFactory('factory', factory);
            assert.deepEqual(
                service,
                (new Service('factory'))
                    .useFactory(factory)
            )
        });

        it('as factory with dependencies', () => {
            const factory = sinon.stub();
            const service = dic.serviceAsFactory('factory', factory, ['A', 'B']);
            assert.deepEqual(
                service,
                (new Service('factory'))
                    .useFactory(factory)
                    .dependsOn('A', 'B')
            )
        });

        it('as async factory', () => {
            const asyncFactory = sinon.stub();
            const service = dic.serviceAsAsyncFactory('asyncFactory', asyncFactory);
            assert.deepEqual(
                service,
                (new Service('asyncFactory'))
                    .useAsyncFactory(asyncFactory)
            )
        });

        it('as async factory with dependencies', () => {
            const asyncFactory = sinon.stub();
            const service = dic.serviceAsAsyncFactory('asyncFactory', asyncFactory, ['A', 'B']);
            assert.deepEqual(
                service,
                (new Service('asyncFactory'))
                    .useAsyncFactory(asyncFactory)
                    .dependsOn('A', 'B')
            )
        });
    });

    describe('getting services by predicate', () => {
        const serviceObjectA = {service: 'A'};
        const serviceObjectB = {service: 'B'};
        const serviceObjectC = {service: 'C'};
        const predicate = (service) => {
            return service.name === 'A' || service.name === 'C';
        };

        let dic;

        beforeEach(() => {
            dic = new AlphaDIC;
            dic.serviceAsValue('A', serviceObjectA);
            dic.serviceAsValue('B', serviceObjectB);
            dic.serviceAsValue('C', serviceObjectC);
        });

        it('via promise', (done) => {
            dic.getByPredicate(predicate)
                .then((services) => {
                    assert.deepEqual(services, [serviceObjectA, serviceObjectC]);
                })
                .then(done, done);
        });

        it('via callback', (done) => {
            dic.getByPredicate(predicate, (err, services) => {
                try {
                    assert.notOk(err);
                    assert.deepEqual(services, [serviceObjectA, serviceObjectC]);
                } catch (e) {
                    return done(e);
                }
                done(err);
            });
        });
    });

    describe('getting services by annotation', () => {
        const serviceObjectA = {service: 'A'};
        const serviceObjectB = {service: 'B'};
        const serviceObjectC = {service: 'C'};

        let dic;

        beforeEach(() => {
            dic = new AlphaDIC;
            dic.serviceAsValue('A', serviceObjectA)
                .annotate('tag');
            dic.serviceAsValue('B', serviceObjectB)
                .annotate('tag');
            dic.serviceAsValue('C', serviceObjectC);
        });

        it('via promise', (done) => {
            dic.getByAnnotationName('tag')
                .then((services) => {
                    assert.deepEqual(services, [serviceObjectA, serviceObjectB]);
                })
                .then(done, done);
        });

        it('via callback', (done) => {
            dic.getByAnnotationName('tag', (err, services) => {
                try {
                    assert.notOk(err);
                    assert.deepEqual(services, [serviceObjectA, serviceObjectB]);
                } catch (e) {
                    return done(e);
                }
                done(err);
            });
        });
    });

    describe('fails for attempt of getting an instance of service without any value', () => {
        let dic;

        beforeEach(() => {
            dic = new AlphaDIC;
            dic.service('A');
        });

        it('via promise', (done) => {
            dic.get('A')
                .then(() => {
                    throw new Error('Should not be successful');
                }, (err) => {
                    assert.strictEqual(err.message, `No constructor or factory defined for service A`);
                })
                .then(done, done);
        });

        it('via callback', (done) => {
            dic.get('A', (err) => {
                try {
                    assert.ok(err);
                    assert.strictEqual(err.message, `No constructor or factory defined for service A`);
                } catch (e) {
                    return done(e);
                }

                done();
            });
        });
    });

    it('non-cacheable services are created every time', (done) => {
        const factory = sinon.stub();
        const serviceObject1 = {attempt: 1};
        const serviceObject2 = {attempt: 2};

        dic.serviceAsFactory('A', factory)
            .nonCacheable();

        factory.onCall(0).returns(serviceObject1);
        factory.onCall(1).returns(serviceObject2);

        Promise.all([
            dic.get('A'),
            dic.get('A')
        ])
            .then((services) => {
                assert.deepEqual(services, [serviceObject1, serviceObject2]);
            })
            .then(done, done);
    });

    it('cacheable services are created only once', (done) => {
        const factory = sinon.stub();
        const serviceObject = {service: 'A'};

        dic.serviceAsFactory('A', factory);

        factory.onCall(0).returns(serviceObject);
        factory.onCall(1).throws(new Error('Factory should not be called twice'));

        Promise.all([
            dic.get('A'),
            dic.get('A')
        ])
            .then((services) => {
                assert.strictEqual(services[0], serviceObject);
                assert.strictEqual(services[1], serviceObject);
            })
            .then(done, done);
    });

    it('async regular factory', (done) => {
        const serviceObject = {service: 'A'};

        dic.serviceAsFactory('A', () => {
            return Promise.resolve(serviceObject);
        });

        dic.get('A')
            .then((service) => {
                assert.strictEqual(service, serviceObject);
            })
            .then(done, done);
    });

    it('service as a value', (done) => {
        const serviceObject = {service: 'A'};

        dic.serviceAsValue('A', serviceObject);

        dic.get('A')
            .then((service) => {
                assert.strictEqual(service, serviceObject);
            })
            .then(done, done);
    });

    it('getting definitions of services', () => {
        const serviceA = dic.service('A');
        const serviceB = dic.service('B');
        const serviceC = dic.service('C');

        assert.deepEqual(dic.getServicesDefinitions(), {
            A: serviceA,
            B: serviceB,
            C: serviceC
        });
    });

    it('getting definitions of given name', () => {
        const serviceA = dic.service('A');
        dic.service('B');
        dic.service('C');

        assert.deepEqual(dic.getServiceDefinition('A'), serviceA);
    });

    it('getting definition of undefined service', () => {
        assert.isUndefined(dic.getServiceDefinition('A'));
    });

    it('findByPredicate returns services that match given predicate', () => {
        const serviceA = dic.service('A');
        dic.service('B');
        const serviceC = dic.service('C');

        const result = dic.findByPredicate((service) => {
            return service === serviceA || service === serviceC;
        });
        assert.deepEqual(result, [
            serviceA,
            serviceC
        ])
    });

    describe('findByAnnotation', () => {
        let serviceA, serviceB, serviceC, serviceD, serviceE;
        let dic;
        const eventListenerAnnotationName = 'event-listener';
        const eventListenerProperties = {event: 'new-user', priority: 50};
        const eventListenerProperties2 = {event: 'new-article', extra: 'property', withExtra: 'parameters'};
        const eventListenerAnnotation = Object.assign({name: eventListenerAnnotationName}, eventListenerProperties);

        const middlewareAnnotation = {name: 'middleware', chain: 'express'};

        const assertFoundServices = (result, expectedServices) => {
            const mapper = s => s.name;

            assert.deepEqual(result.map(mapper), expectedServices.map(mapper), 'Invalid services found');
        };

        beforeEach(() => {
            dic = new AlphaDIC;
            serviceA = dic.serviceAsValue('A', {service: 'A'})
                .annotate(eventListenerAnnotation);

            serviceB = dic.serviceAsValue('B', {service: 'B'})
                .annotate(eventListenerAnnotationName, eventListenerProperties);

            serviceC = dic.serviceAsValue('C', {service: 'C'})
                .annotate(middlewareAnnotation);

            serviceD = dic.serviceAsValue('D', {service: 'D'})
                .annotate(eventListenerAnnotation)
                .annotate(middlewareAnnotation);

            serviceE = dic.serviceAsValue('E', {service: 'E'})
                .annotate(eventListenerAnnotationName, eventListenerProperties2);
        });

        it('by name', () => {
            const result = dic.findByAnnotation(eventListenerAnnotationName);

            assertFoundServices(result, [
                serviceA,
                serviceB,
                serviceD,
                serviceE
            ]);
        });

        it('by name and properties', () => {

            const result = dic.findByAnnotation(eventListenerAnnotationName, {
                event: 'new-user'
            });

            assertFoundServices(result, [
                serviceA,
                serviceB,
                serviceD
            ]);
        });

        it('by name but service might have other annotations', () => {
            const result = dic.findByAnnotation(middlewareAnnotation.name);

            assertFoundServices(result, [
                serviceC,
                serviceD
            ]);
        });

        it('by name as predicate', () => {
            const result = dic.findByAnnotation((name) => {
                return name === eventListenerAnnotationName;
            });

            assertFoundServices(result, [
                serviceA,
                serviceB,
                serviceD,
                serviceE
            ]);
        });

        it('by name and properties as predicate', () => {
            const result = dic.findByAnnotation(eventListenerAnnotationName, (properties) => {
                return properties.event === eventListenerProperties.event;
            });

            assertFoundServices(result, [
                serviceA,
                serviceB,
                serviceD
            ]);
        });

        it('by advanced properties', () => {
            const result = dic.findByAnnotation(eventListenerAnnotationName, {
                extra: 'property',
                withExtra: 'parameters'
            });

            assertFoundServices(result, [
                serviceE
            ]);
        })
    });
});