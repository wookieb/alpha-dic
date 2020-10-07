import * as sinon from 'sinon';
import {fromConstructor, fromFactory, fromValue} from "@src/serviceFactories";

describe('serviceFactories', () => {

    const ARGS = [1, 2, 3, 4];
    const CONTEXT = {};

    describe('factory', () => {
        it('applies a function with all given arguments and specific context', () => {
            const expectedResult = {foo: 'bar'};
            const stub = sinon.stub()
                .returns(expectedResult);

            const factory = fromFactory(stub);
            const result = factory.apply(CONTEXT, ARGS);

            expect(result)
                .toStrictEqual(expectedResult);
            sinon.assert.calledOn(stub, CONTEXT);
            sinon.assert.calledWithExactly(stub, ...ARGS);
        });
    });

    describe('constructor', () => {
        it('create a new object using provided constructor with given arguments', () => {
            const spy = sinon.spy();

            class TestClass {
                constructor() {
                    spy.apply(this, arguments as any);
                }
            }

            const factory = fromConstructor(TestClass);
            const result = factory.apply(CONTEXT, ARGS);

            expect(result)
                .toBeInstanceOf(TestClass);
            sinon.assert.calledWithExactly(spy, ...ARGS);
        });
    });

    describe('value', () => {
        it('simply returns provided value regardless of arguments', () => {
            const value = {foo: 'bar'};

            const factory = fromValue(value);

            const result = factory.apply(CONTEXT, ARGS);
            expect(result)
                .toStrictEqual(value);
        });
    })
});