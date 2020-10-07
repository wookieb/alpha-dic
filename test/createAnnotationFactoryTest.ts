import {createAnnotationFactory} from "@src/createAnnotationFactory";
import {getDefinitionForClass, Service} from "@src/decorators/Service";
import * as sinon from 'sinon';

describe('createAnnotationFactory', () => {
    const NAME = 'annotationName';

    describe('predicate', () => {
        const annotation = createAnnotationFactory(NAME);
        it('accepts object that is an annotation of given name', () => {
            expect(annotation.predicate(annotation()))
                .toBe(true);
        });

        it.each([
            [undefined],
            [null],
            [{name: 'bar'}]
        ])('ignores other: %s', (value) => {
            expect(annotation.predicate(value))
                .toBe(false);
        })
    });

    describe('andPredicate', () => {
        const annotation = createAnnotationFactory(NAME);

        it('returns false if extra predicate is not satisfied', () => {
            const stub = sinon.stub().returns(false);
            const ann = annotation();
            expect(annotation.andPredicate(stub)(ann))
                .toBe(false);

            sinon.assert.calledWithExactly(stub, ann);
        });

        it('return true if extra predicate is satisfied', () => {
            const stub = sinon.stub().returns(true);
            const ann = annotation();
            expect(annotation.andPredicate(stub)(ann))
                .toBe(true);

            sinon.assert.calledWithExactly(stub, ann)
        });
    });

    describe('with extra attributes factory', () => {
        it('"name" property cannot be overwritten', () => {
            const annotation = createAnnotationFactory(NAME, () => {
                return {name: 'foo'};
            });

            const result = annotation();
            expect(result)
                .toEqual({name: NAME});

            expect(annotation.predicate(result))
                .toBe(true);
        });

        it('adds returned properties to final annotation object', () => {
            const object = {foo: 'bar'};
            const annotation = createAnnotationFactory(NAME, () => {
                return object;
            });

            const result = annotation();
            expect(result)
                .toEqual({
                    name: NAME,
                    ...object
                });
        });
    });

    it('without extra attributes factory', () => {
        const annotation = createAnnotationFactory(NAME);

        const result = annotation();
        expect(result)
            .toEqual({name: NAME});
    });

    it('using decorator', () => {
        const annotation = createAnnotationFactory(NAME);

        @Service()
        @annotation.decorator()
        class Foo {

        }

        const def = getDefinitionForClass(Foo);

        expect(def.annotations)
            .toEqual([
                annotation()
            ]);
    });
});