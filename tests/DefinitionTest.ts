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

    describe('annotation', () => {
        describe('defining', () => {
            it('by name', () => {
                const NAME = 'someName';
                assert.strictEqual(definition.annotate(NAME), definition);
                assert.isTrue(definition.hasAnnotation(NAME));
                assert.deepEqual(definition.getAnnotation(NAME), {name: NAME});
            });

            it('by symbol', () => {
                const SYMBOL = Symbol('someName');

                assert.strictEqual(definition.annotate(SYMBOL), definition);
                assert.isTrue(definition.hasAnnotation(SYMBOL));
                assert.deepEqual(definition.getAnnotation(SYMBOL), {name: SYMBOL});
            });

            it('by name and properties', () => {
                const NAME = 'someName';
                const PROPS = {foo: 1, bar: 2};

                assert.strictEqual(definition.annotate(NAME, PROPS), definition);
                assert.isTrue(definition.hasAnnotation(NAME));
                assert.deepEqual(definition.getAnnotation(NAME), {...PROPS, name: NAME});
            });

            it('by symbol and properties', () => {
                const NAME = 'someName';
                const PROPS = {foo: 1, bar: 2};

                assert.strictEqual(definition.annotate(NAME, PROPS), definition);
                assert.isTrue(definition.hasAnnotation(NAME));
                assert.deepEqual(definition.getAnnotation(NAME), {...PROPS, name: NAME});
            });

            it('by annotation object', () => {
                const ANNOTATION = {
                    name: 'someName',
                    foo: 'bar'
                };

                assert.strictEqual(definition.annotate(ANNOTATION), definition);
                assert.isTrue(definition.hasAnnotation(ANNOTATION.name));
                assert.strictEqual(definition.getAnnotation(ANNOTATION.name), ANNOTATION);
            });

            it('by annotation object with name as a symbol', () => {
                const ANNOTATION = {
                    name: Symbol('someName'),
                    foo: 'bar'
                };

                assert.strictEqual(definition.annotate(ANNOTATION), definition);
                assert.isTrue(definition.hasAnnotation(ANNOTATION.name));
                assert.strictEqual(definition.getAnnotation(ANNOTATION.name), ANNOTATION);
            });

            it('fails if name is empty', () => {
                assert.throws(() => {
                    definition.annotate('');
                }, 'Annotation name has to be a non-empty string or annotation object');
            });

            it('fails if annotation object has no "name" property defined', () => {
                assert.throws(() => {
                    definition.annotate(<any>{foo: 'bar'});
                }, 'Annotation object requires non-empty "name" property');
            });
        });

        it('hasAnnotation returns false if annotation not defined', () => {
            const NAME = 'someName';

            assert.isFalse(definition.hasAnnotation(NAME));
            definition.annotate(NAME);
            assert.isTrue(definition.hasAnnotation(NAME));
        });

        it('getAnnotation returns defined annotation', () => {
            const NAME = 'someName';

            assert.isUndefined(definition.getAnnotation(NAME));
            definition.annotate(NAME);
            assert.deepEqual(definition.getAnnotation(NAME), {name: NAME});
        });
    });
});