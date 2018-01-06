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
});