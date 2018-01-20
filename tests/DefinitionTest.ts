import {Definition} from "../src/Definition";
import {assert} from 'chai';
import * as sinon from 'sinon';

describe('Annotation', () => {
    const ARGS = [1, 2, 3];
    const CONTEXT = {foo: 'bar'};

    let definition: Definition;

    beforeEach(() => {
        definition = new Definition('name');
    });

    it('via static create', () => {
        const def = Definition.create('name');

        assert.propertyVal(def, 'name', 'name');
    });

    it('using constructor', () => {
        const spy = sinon.spy();

        class Test {
            constructor() {
                spy.apply(this, arguments);
            }
        }

        assert.strictEqual(definition.useConstructor(Test), definition);

        const result = definition.factory.apply(CONTEXT, ARGS);
        assert.instanceOf(result, Test);
        sinon.assert.calledWithExactly(spy, ...ARGS);
    });

    it('using class', () => {
        const spy = sinon.spy();

        class Test {
            constructor() {
                spy.apply(this, arguments);
            }
        }

        assert.strictEqual(definition.useClass(Test), definition);

        const result = definition.factory.apply(CONTEXT, ARGS);
        assert.instanceOf(result, Test);
        sinon.assert.calledWithExactly(spy, ...ARGS);
    });

    it('using factory', () => {
        const expectedResult = {foo: 'bar'};
        const stub = sinon.stub().returns(expectedResult);

        assert.strictEqual(definition.useFactory(stub), definition);

        const result = definition.factory.apply(CONTEXT, ARGS);

        assert.strictEqual(result, expectedResult);
        sinon.assert.calledOn(stub, CONTEXT);
        sinon.assert.calledWithExactly(stub, ...ARGS);
    });

    it('using value', () => {
        const expectedResult = {foo: 'bar'};

        assert.strictEqual(definition.useValue(expectedResult), definition);
        assert.strictEqual(definition.factory.apply(CONTEXT, ARGS), expectedResult);
    });

    it('setting args', () => {
        definition.withArgs(...ARGS);
        assert.sameMembers(definition.args, ARGS);
    });

    it('annotation', () => {
        const annotation = {name: 'test'};

        assert.strictEqual(definition.annotate(annotation), definition);

        assert.sameMembers(definition.annotations, [annotation]);
    });

    it('multiple annotations', () => {
        const annotation1 = {name: 'test1'};
        const annotation2 = {name: 'test2'};

        assert.strictEqual(definition.annotate(annotation1, annotation2), definition);
        assert.sameMembers(definition.annotations, [annotation1, annotation2]);
    });

    it('locking makes object immutable', () => {
        const definition = Definition.create('name')
            .annotate('someAnnotation')
            .withArgs('some', 'args');

        definition.lock();


        assert.isTrue(Object.isFrozen(definition));
        assert.isTrue(Object.isFrozen(definition.args));
        assert.isTrue(Object.isFrozen(definition.annotations));
    });

    describe('Modify', () => {
        const definition = Definition.create('someName')
            .annotate('annotation1', 'annotation2')
            .withArgs('arg1', 'arg2')
            .lock();

        it('modfying name', () => {
            const name = 'newName';
            const newDefinition = definition.modify({name});

            assert.deepEqual(newDefinition, Definition.create(name)
                .annotate(...definition.annotations)
                .withArgs(...definition.args));

            assert.isTrue(Object.isFrozen(newDefinition));
        });

        it('modifying annotations', () => {
            const annotations = ['new', 'annotations'];
            const newDefinition = definition.modify({annotations});

            assert.deepEqual(newDefinition, Definition.create(definition.name)
                .annotate(...annotations)
                .withArgs(...definition.args));

            assert.isTrue(Object.isFrozen(newDefinition));
        });

        it('modifying args', () => {
            const args = ['new', 'args'];
            const newDefinition = definition.modify({args});

            assert.deepEqual(newDefinition, Definition.create(definition.name)
                .annotate(...definition.annotations)
                .withArgs(...args));

            assert.isTrue(Object.isFrozen(newDefinition));
        });

        it('modifying multiple things at a time', () => {
            const args = ['new', 'args'];
            const annotations = ['new', 'annotations'];
            const newDefinition = definition.modify({args, annotations});

            assert.deepEqual(newDefinition, Definition.create(definition.name)
                .annotate(...annotations)
                .withArgs(...args));

            assert.isTrue(Object.isFrozen(newDefinition));
        });
    });
});