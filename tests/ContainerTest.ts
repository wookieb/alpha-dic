import {Container} from "../src/Container";
import {assert} from 'chai';
import {Definition} from "../src/Definition";
import * as sinon from 'sinon';
import {ContainerArg} from "../src/ContainerArg";
import {SinonStub} from "sinon";
import {Reference} from "../src/Reference";

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

    it('registering definition', () => {
        const def = new Definition('someName');
        container.registerDefinition(def);
        assert.strictEqual(container.findByName(def.name), def);
    });

    it('creating with registration', () => {
        const def = container.definition('someName');
        assert.strictEqual(container.findByName(def.name), def);
    });


    describe('finding', () => {
        it('by name', () => {
            assert.strictEqual(container.findByName('A'), definitionA);
        });

        it('by predicate', () => {
            assert.sameMembers(container.findByPredicate((d) => d.name === 'B'), [definitionB]);
        });

        it('by annotation name', () => {
            assert.sameMembers(container.findByAnnotation(ANNOTATION.name), [
                definitionA
            ]);
        });

        it('by annotation predicate', () => {
            assert.sameMembers(container.findByAnnotationPredicate(a => a.name === ANNOTATION2.name), [
                definitionB
            ]);
        });
    });

    describe('getting instances', () => {
        it('by name', async () => {
            assert.strictEqual(await container.get('A'), serviceA);
        });

        it('by predicate', async () => {
            assert.sameMembers(await container.getByPredicate(d => d.name === 'B'), [serviceB]);
        });

        it('by annotation name', async () => {
            assert.sameMembers(await container.getByAnnotation(ANNOTATION.name), [serviceA]);
        });

        it('by annotation predicate', async () => {
            assert.sameMembers(await container.getByAnnotationPredicate(a => a.name === ANNOTATION2.name), [serviceB]);
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

            assert.strictEqual(p1, p2, 'container should return exactly the same promise for same service');

            assert.strictEqual(await p1, result);
            assert.strictEqual(await p2, result);

            sinon.assert.calledOnce(stub);
        });

        it('definition factory is called with definition arguments', async () => {
            const result = {foo: 'bar'};
            const stub = sinon.stub().returns(result);
            const args = [1, 2, 3, 4];

            container.definition('C')
                .useFactory(stub)
                .withArgs(...args);

            assert.strictEqual(await container.get('C'), result);
            sinon.assert.calledWithExactly(stub, ...args);
        });

        it('container args are resolved before providing to definition factory', async () => {
            const arg: ContainerArg = sinon.createStubInstance(ContainerArg);
            const argValue = {foo: 'value'};

            (<SinonStub>arg.getArgument).withArgs(container)
                .resolves(argValue);

            const result = {foo: 'bar'};
            const stub = sinon.stub().returns(result);

            container.definition('C')
                .useFactory(stub)
                .withArgs(1, 2, arg, 4);

            assert.strictEqual(await container.get('C'), result);
            sinon.assert.calledWithExactly(stub, 1, 2, argValue, 4);
        });

        it('fails if definition contains circular reference', () => {
            container.findByName('A')
                .withArgs(Reference.one.name('B'));

            container.findByName('B')
                .withArgs(Reference.one.name('A'));

            return assert.isRejected(container.get('A'), /Circular dependency found: A \-> B \-> A/);
        });

        it('fails if definition dependency contains circular reference', () => {
            container.findByName('A')
                .withArgs(Reference.one.name('B'));

            container.findByName('B')
                .withArgs(Reference.one.name('C'));

            container.definition('C')
                .useValue('foo')
                .withArgs(Reference.one.name('B'));

            return assert.isRejected(container.get('A'), /Circular dependency found: A \-> B \-> C \-> B/);
        });

        it('fails if service definition with given name does not exist', () => {
            return assert.isRejected(container.get('foo'), /Service "foo" does not exist/);
        });

        it('fails if definition is incomplete', () => {
            container.definition('C');

            return assert.isRejected(container.get('C'), /Missing factory for service definition "C"/)
        });
    });

    describe('middlewares', () => {
        it('are called one by one in order of registration to container', async () => {
            const middleware1 = sinon.stub().callsFake((d, next) => {
                return next(d);
            });

            const middleware2 = sinon.stub().callsFake((d, next) => {
                return next(d);
            });

            container.addMiddleware(middleware1, middleware2);

            assert.strictEqual(await container.get('A'), serviceA);

            sinon.assert.calledWith(middleware1, container.findByName('A'));
            sinon.assert.calledWith(middleware2, container.findByName('A'));

            sinon.assert.callOrder(middleware1, middleware2);
        });

        it('if middleware returns non-thenable value then the value gets converted to promise', async () => {
            const result = {foo: 'bar'};
            const middleware = sinon.stub().returns(result);

            container.addMiddleware(middleware);

            const service = container.get('A');

            assert.instanceOf(service, Promise);
            assert.strictEqual(await service, result);
        });

        it('middleware can break the call chain preventing other middlewares to be called', async () => {
            const result = {foo: 'bar'};
            const middleware1 = sinon.stub().returns(result);
            const middleware2 = sinon.stub().callsFake((d, next) => {
                return next(d);
            });

            container.addMiddleware(middleware1, middleware2);

            assert.strictEqual(await container.get('A'), result);

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

            assert.strictEqual(await container.get('A'), result);

            sinon.assert.calledWith(middleware1, container.findByName('A'));
            sinon.assert.calledWith(middleware2, definition);

            sinon.assert.callOrder(middleware1, middleware2);
        })
    })
});