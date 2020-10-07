import {Container} from "@src/Container";
import {Definition} from "@src/Definition";
import * as sinon from 'sinon';
import {ContainerArg} from "@src/args/ContainerArg";
import {SinonStub} from "sinon";
import {ReferenceArg} from "@src/args/ReferenceArg";
import * as errors from "@src/errors";
import {assertThrowsErrorWithCode} from "./common";
import {Middleware, onMiddlewareAttach} from "@src/types";
import {TypeRef} from "@src/TypeRef";
import debug = require('debug');
import {create} from "@src/index";

describe('Container', () => {
    let container: Container;
    let definitionA: Definition;
    let definitionB: Definition;

    const serviceA = {service: 'A'};
    const serviceB = {service: 'B'};

    const ANNOTATION = {name: 'annotation1'};
    const ANNOTATION2 = {name: 'annotation2'};

    beforeEach(() => {
        container = new Container();

        definitionA = container.definition('A')
            .useValue(serviceA)
            .annotate(ANNOTATION);

        definitionB = container.definition('B')
            .useValue(serviceB)
            .annotate(ANNOTATION2);
    });

    describe('defining services', () => {
        const NAME = 'someServiceName';

        it('registering definition sets its owner', () => {
            const def = new Definition(NAME);
            expect(def.owner)
                .toBeUndefined();
            container.registerDefinition(def);
            expect(def.owner)
                .toStrictEqual(container);
        });

        it('registering definition', () => {
            const def = new Definition(NAME);
            container.registerDefinition(def);
            expect(container.findByName(NAME))
                .toEqual(def);
        });

        it('register definition with the same name', () => {
            const def = new Definition(NAME);
            container.registerDefinition(def);

            assertThrowsErrorWithCode(() => {
                container.registerDefinition(def);
            }, errors.ALREADY_DEFINED);
        });

        it('creating with registration', () => {
            const def = container.definition(NAME);
            expect(container.findByName(NAME))
                .toEqual(def);
        });

        it('(as constructor) with registration', () => {
            class Test {
                public readonly args: any[];

                constructor(...args: any[]) {
                    this.args = args;
                }
            }

            const definition = container.definitionWithConstructor(NAME, Test);

            expect(container.findByName(NAME))
                .toEqual(definition);
            expect(definition.factory(1, 2))
                .toEqual(new Test(1, 2));
        });

        it('(as constructor) with registration without name', () => {
            class Test {
                public readonly args: any[];

                constructor(...args: any[]) {
                    this.args = args;
                }
            }

            const definition = container.definitionWithConstructor(Test);
            expect(definition.name)
                .toMatch(/^Test.*/);


            expect(definition.factory(1, 2))
                .toEqual(new Test(1, 2));
        });

        it('creating (as factory) with registration', () => {
            const factoryResult = {foo: 'bar'};
            const factory = sinon.stub()
                .returns(factoryResult);

            const definition = container.definitionWithFactory(NAME, factory);
            expect(container.findByName(NAME))
                .toStrictEqual(definition);

            expect(definition.factory(1, 2, 3))
                .toEqual(factoryResult);

            sinon.assert.calledWithExactly(factory, 1, 2, 3);
        });

        it('creating (as factory) with registration without name', () => {
            class Foo {}

            const factoryResult = new Foo;
            const factory = sinon.stub()
                .returns(factoryResult);

            const definition = container.definitionWithFactory(factory, Foo);
            expect(container.findByName(definition.name))
                .toEqual(definition);

            expect(definition.type)
                .toEqual(TypeRef.createFromType(Foo));

            expect(definition.factory(1, 2, 3))
                .toEqual(factoryResult);
            sinon.assert.calledWithExactly(factory, 1, 2, 3);
        });

        it('creating (as value) with registration with global type', () => {
            const val = {foo: 'bar'};
            const definition = container.definitionWithValue(NAME, val);
            expect(container.findByName(NAME))
                .toStrictEqual(definition);

            expect(definition.factory())
                .toStrictEqual(val);

            expect(definition.type)
                .toBeUndefined();
        });

        it('creating (as value) with registration with class type', () => {
            class Foo {}

            const val = new Foo;

            const definition = container.definitionWithValue(NAME, val);
            expect(container.findByName(NAME))
                .toStrictEqual(definition);

            expect(definition.factory())
                .toStrictEqual(val);

            expect(definition.type)
                .toEqual(TypeRef.createFromType(Foo));
        });

        it('creating (as value) without name', () => {
            class Foo {}

            const val = new Foo;
            const definition = container.definitionWithValue(val);
            expect(container.findByName(definition.name))
                .toStrictEqual(definition);

            expect(definition.name)
                .toMatch(/^Foo.*/);

            expect(definition.factory())
                .toStrictEqual(val);

            expect(definition.type)
                .toEqual(TypeRef.createFromType(Foo));
        });
    });

    describe('finding', () => {
        it('by name', () => {
            expect(container.findByName('A'))
                .toEqual(definitionA);
        });

        it('by predicate', () => {
            expect(container.findByPredicate(d => d.name === 'B'))
                .toEqual([definitionB]);
        });

        describe('by annotation', () => {
            it('by some predicate', () => {
                expect(
                    container.findByAnnotation(a => a.name === ANNOTATION.name)
                )
                    .toEqual([
                        definitionA
                    ]);
            });

            it('with annotation', () => {
                expect(container.findByAnnotation(() => true, true))
                    .toEqual([
                        [definitionA, ANNOTATION],
                        [definitionB, ANNOTATION2]
                    ]);
            });

            it('without annotation', () => {
                expect(container.findByAnnotation(() => true, false))
                    .toEqual([
                        definitionA,
                        definitionB
                    ]);
            });
        })
    });

    describe('getting instances', () => {
        it('by name', () => {
            return expect(container.get('A'))
                .resolves
                .toEqual(serviceA);
        });

        it('by predicate', () => {
            return expect(container.getByPredicate(d => d.name === 'B'))
                .resolves
                .toEqual([serviceB])
        });

        it('by annotation', () => {
            return expect(container.getByAnnotation(a => a.name === ANNOTATION.name))
                .resolves
                .toEqual([serviceA]);
        });

        it('by annotation with annotation', () => {
            return expect(container.getByAnnotation(() => true, true))
                .resolves
                .toEqual([
                    [serviceA, ANNOTATION],
                    [serviceB, ANNOTATION2]
                ]);
        });

        it('by annotation without annotation', async () => {
            return expect(container.getByAnnotation(() => true, false))
                .resolves
                .toEqual([
                    serviceA,
                    serviceB
                ]);
        });
    });

    describe('creating services', () => {
        it('definition factory is called only once and previously returned value is being returned all the time', async () => {
            const result = {foo: 'bar'};
            const stub = sinon.stub().returns(result);

            container.definition('C')
                .useFactory(stub);

            const p1 = container.get('C');
            const p2 = container.get('C');

            expect(p1)
                .toEqual(p2);

            expect(await p1)
                .toEqual(result);

            expect(await p2)
                .toEqual(result);

            sinon.assert.calledOnce(stub);
        });

        it('definition factory is called with definition arguments', async () => {
            const result = {foo: 'bar'};
            const stub = sinon.stub().returns(result);
            const args = [1, 2, 3, 4];

            container.definition('C')
                .useFactory(stub)
                .withArgs(...args);

            expect(await container.get('C'))
                .toEqual(result);

            sinon.assert.calledWithExactly(stub, ...args);
        });

        it('container args are resolved before providing to definition factory', async () => {
            class DummyArg extends ContainerArg {
                getArgument(container: Container): Promise<any> {
                    return Promise.resolve(undefined);
                }

                getDependentServices(container: Container): Definition | Definition[] {
                    return [];
                }
            }

            const arg = sinon.createStubInstance(DummyArg);
            const argValue = {foo: 'value'};

            arg.getArgument
                .withArgs(container)
                .resolves(argValue);

            const result = {foo: 'bar'};
            const stub = sinon.stub().returns(result);

            container.definition('C')
                .useFactory(stub)
                .withArgs(1, 2, arg, 4);

            expect(await container.get('C'))
                .toEqual(result);
            sinon.assert.calledWithExactly(stub, 1, 2, argValue, 4);
        });

        it('fails if definition contains circular reference', () => {
            container.findByName('A')!
                .withArgs(ReferenceArg.one.name('B'));

            container.findByName('B')!
                .withArgs(ReferenceArg.one.name('A'));

            return expect(container.get('A'))
                .rejects
                .toThrowError(/Circular dependency found: A \-> B \-> A/)
        });

        it('fails if definition dependency contains circular reference', () => {
            container.findByName('A')!
                .withArgs(ReferenceArg.one.name('B'));

            container.findByName('B')!
                .withArgs(ReferenceArg.one.name('C'));

            container.definition('C')
                .useValue('foo')
                .withArgs(ReferenceArg.one.name('B'));

            return expect(container.get('A'))
                .rejects
                .toThrowError(/Circular dependency found: A \-> B \-> C \-> B/);
        });

        it('fails if service definition with given name does not exist', () => {
            return expect(container.get('foo'))
                .rejects
                .toThrowError(/Service "foo" does not exist/);
        });

        it('fails if definition is incomplete', () => {
            container.definition('C');

            return expect(container.get('C'))
                .rejects
                .toThrowError(/Missing factory for service definition "C"/);
        });
    });

    describe('middlewares', () => {

        it('call onMiddlewareAttached method once attached to container', () => {
            const hookStub = sinon.stub();
            const middleware = sinon.stub();
            (middleware as any)[onMiddlewareAttach] = hookStub;

            container.addMiddleware(middleware);
            sinon.assert.calledOnce(hookStub);
            sinon.assert.calledWith(hookStub, container);
        });

        it('are called one by one in order of registration to container', async () => {
            const middleware1 = sinon.stub().callsFake((d, next) => {
                return next(d);
            });

            const middleware2 = sinon.stub().callsFake((d, next) => {
                return next(d);
            });

            container.addMiddleware(middleware1, middleware2);

            expect(await container.get('A'))
                .toEqual(serviceA);

            sinon.assert.calledWith(middleware1, container.findByName('A'));
            sinon.assert.calledWith(middleware2, container.findByName('A'));

            sinon.assert.callOrder(middleware1, middleware2);
        });

        it('if middleware returns non-thenable value then the value gets converted to promise', async () => {
            const result = {foo: 'bar'};
            const middleware = sinon.stub().returns(result);

            container.addMiddleware(middleware);

            const service = container.get('A');

            expect(service)
                .toBeInstanceOf(Promise);

            expect(await service)
                .toEqual(result);
        });

        it('middleware can break the call chain preventing other middlewares to be called', async () => {
            const result = {foo: 'bar'};
            const middleware1 = sinon.stub().returns(result);
            const middleware2 = sinon.stub().callsFake((d, next) => {
                return next(d);
            });

            container.addMiddleware(middleware1, middleware2);

            expect(await container.get('A'))
                .toEqual(result);

            sinon.assert.calledWith(middleware1, container.findByName('A'));
            sinon.assert.notCalled(middleware2);
        });

        it('middleware can override definition provided to other middlewares', async () => {
            const result = {foo: 'bar'};
            const definition = new Definition('C')
                .useValue(result);


            const middleware1 = sinon.stub().callsFake((d, next) => {
                return next(definition);
            });

            const middleware2 = sinon.stub().callsFake((d, next) => {
                return next(d);
            });

            container.addMiddleware(middleware1, middleware2);

            expect(await container.get('A'))
                .toEqual(result);

            sinon.assert.calledWith(middleware1, container.findByName('A'));
            sinon.assert.calledWith(middleware2, definition);

            sinon.assert.callOrder(middleware1, middleware2);
        })
    });

    describe('Hierarchical', () => {
        let parentContainer: Container;
        let definitionA: Definition;
        let definitionB: Definition;
        beforeEach(() => {

            parentContainer = new Container();
            container = new Container(parentContainer);

            definitionA = parentContainer.definition('A')
                .useValue(serviceA)
                .annotate(ANNOTATION);

            definitionB = container.definition('B')
                .useValue(serviceB)
                .annotate(ANNOTATION2);
        });

        describe('middlewares', () => {
            let middleware: sinon.SinonStub;
            beforeEach(() => {
                middleware = sinon.stub();
            });

            it('registering child middleware does not affect parent', () => {
                container.addMiddleware(middleware);

                expect(container.getMiddlewares())
                    .toEqual([middleware]);

                expect(parentContainer.getMiddlewares())
                    .toEqual([]);
            });

            it('middleware in parent and child', () => {
                const middleware2 = sinon.stub();
                parentContainer.addMiddleware(middleware);
                container.addMiddleware(middleware2);

                expect(container.getMiddlewares())
                    .toEqual([middleware2]);

                expect(parentContainer.getMiddlewares())
                    .toEqual([middleware]);
            });
        });

        describe('finding by name', () => {
            it('from parent container', () => {
                expect(container.findByName('A'))
                    .toStrictEqual(definitionA)
            });

            it('from current container', () => {
                expect(container.findByName('B'))
                    .toStrictEqual(definitionB);
            });

            it('definition from child container does not exist in parent container', () => {
                expect(parentContainer.findByName('B'))
                    .toBeUndefined();
            });
        });

        describe('finding by predicate', () => {
            it('returns all services for true predicate', () => {
                expect(container.findByPredicate(x => true))
                    .toEqual([
                        definitionB,
                        definitionA
                    ]);
            });

            it('returns services that satisfies predicate', () => {
                expect(container.findByPredicate(s => s.name === 'A'))
                    .toEqual([definitionA]);
            })
        });

        describe('finding by annotation predicate', () => {
            it('returns all services for true predicate', () => {
                expect(container.findByAnnotation(() => true))
                    .toEqual([
                        definitionB,
                        definitionA
                    ]);
            });

            it('returns services that match predicate', () => {
                //tslint:disable-next-line: strict-comparisons
                expect(container.findByAnnotation(a => a === ANNOTATION))
                    .toEqual([definitionA]);

                //tslint:disable-next-line: strict-comparisons
                expect(container.findByAnnotation(a => a === ANNOTATION2))
                    .toEqual([definitionB]);
            });

            it('child containers are ignored when looking in parent container', () => {
                expect(parentContainer.findByAnnotation(() => true))
                    .toEqual([definitionA]);
            });
        });

        describe('getting instance from parent', () => {
            it('does not cache result in current container', async () => {
                const serviceX = {};
                const factory = sinon.stub()
                    .returns(serviceX);

                parentContainer.definition('X')
                    .useFactory(factory);

                const containerA = new Container(parentContainer);
                const containerB = new Container(parentContainer);

                expect(await containerA.get('X'))
                    .toEqual(serviceX);

                expect(await containerB.get('X'))
                    .toEqual(serviceX);

                sinon.assert.calledOnce(factory);
            });
        });
    });

    describe('slow log', () => {
        let logs: string[] = [];
        let container: Container;

        beforeEach(() => {
            logs = [];
            container = new Container();
            debug.enable('alpha-dic:slow-creation');
            sinon.stub(debug, 'log')
                .callsFake(message => logs.push(message));
        })

        afterEach(() => {
            logs = [];
            debug.disable();
            (debug.log as sinon.SinonStub).restore();
        });

        it('success', async () => {
            container.slowLogThreshold = 100;
            const d = container.definitionWithFactory(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(undefined)
                    }, 150);
                })
            });

            await container.get(d);
            expect(logs[0])
                .toEqual(expect.stringMatching(/long time to create/));
        });

        it('disabling', async () => {
            container.slowLogThreshold = 0;

            const d = container.definitionWithFactory(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(undefined)
                    }, 150);
                })
            });

            await container.get(d);
            expect(logs)
                .toHaveLength(0);
        });

        it('custom threshold', async () => {
            container.slowLogThreshold = 500;

            const d = container.definitionWithFactory(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(undefined)
                    }, 550);
                })
            });

            await container.get(d);
            expect(logs[0])
                .toEqual(expect.stringMatching(/long time to create/));
        });
    });


    describe('aliasing', () => {
        it('success', () => {
            const service = {service: 'value'};
            const container = create();
            const container2 = create();
            const definition = container.definitionWithValue(service);

            const newDef = container2.alias(definition);

            expect(newDef)
                .toBeInstanceOf(Definition);

            expect(newDef)
                .not
                .toStrictEqual(definition);

            return expect(container2.get(newDef.name))
                .resolves
                .toStrictEqual(service);
        });
    });
});