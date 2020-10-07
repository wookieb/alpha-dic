import {TypeRef} from "@src/TypeRef";
import {Definition} from "@src/Definition";

describe('TypeRef', () => {

    class Foo {}

    class Bar extends Foo {}

    class Gamma {}

    const RESERVED_TYPES: any[] = [
        [Object],
        [Promise],
        [Function]
    ];

    it('is', () => {
        expect(TypeRef.is(new TypeRef(Foo)))
            .toEqual(true);

        expect(TypeRef.is('typeref'))
            .toEqual(false);
    });


    describe('matches', () => {
        it('satisfied if type is the same', () => {
            expect(TypeRef.createFromType(Foo)!.matches(new TypeRef(Foo)))
                .toEqual(true);
        });

        it('satisfied if target is instance of root type', () => {
            expect(TypeRef.createFromType(Foo)!.matches(new TypeRef(Bar)))
                .toEqual(true);
        });

        it('not satisfied if type is not related', () => {
            expect(TypeRef.createFromType(Foo)!.matches(new TypeRef(Gamma)))
                .toEqual(false);
        });
    });

    describe('predicate', () => {
        it('returns false for definitions without type', () => {
            const definition = Definition.create();
            expect(TypeRef.createFromType(Foo)!.predicate(definition))
                .toEqual(false);
        });

        it('returns true for definition with matching type', () => {
            const definition = Definition.create()
                .markType(Foo);

            expect(TypeRef.createFromType(Foo)!.predicate(definition))
                .toEqual(true);
        });

        it('return false for definition without matching type', () => {
            const definition = Definition.create()
                .markType(Gamma);

            expect(TypeRef.createFromType(Foo)!.predicate(definition))
                .toEqual(false);
        });
    });

    describe('creating', () => {
        it('constructor', () => {
            const ref = new TypeRef(Foo);

            expect(ref.toString())
                .toEqual('instance of class "Foo"');
        });

        it.each(RESERVED_TYPES)('fails when attempt to create for reserved type: %s', constructor => {
            expect(() => {
                // tslint:disable-next-line:no-unused-expression
                new TypeRef(constructor);
            })
                .toThrowErrorMatchingSnapshot();
        });

        describe('from value', () => {
            it.each([
                [false],
                [true],
                ['str'],
                [undefined]
            ])('ignores non objects: %s', value => {
                expect(TypeRef.createFromValue(value))
                    .toBeUndefined()
            });

            it('ignores null', () => {
                // tslint:disable-next-line:no-null-keyword
                expect(TypeRef.createFromValue(null))
                    .toBeUndefined();
            });

            it.each([
                [{}],
                [Math.min],
                [Promise.resolve('test')]
            ])('ignores value that is an instance of reserved type: %s', value => {
                expect(TypeRef.createFromValue(value))
                    .toBeUndefined();
            });

            it.each([
                [new Foo, Foo],
                [new Bar, Bar],
                [[], Array]
            ])('success: %s', (value, type) => {
                const ref = TypeRef.createFromValue(value);
                expect(ref)
                    .toEqual(new TypeRef(type));

                expect(String(ref))
                    .toEqual(`instance of class "${type.name}"`)
            });
        });

        describe('from type', () => {
            it.each(RESERVED_TYPES)('returns undefined for reserved types: %s', constructor => {
                expect(TypeRef.createFromType(constructor))
                    .toBeUndefined();
            });

            it.each([
                [Foo],
                [Bar],
                [Array]
            ])('success: %s', constructor => {
                expect(TypeRef.createFromType(constructor))
                    .toEqual(new TypeRef(constructor));
            });
        });

        describe('predicate for type', () => {
            it.each(RESERVED_TYPES)('returns undefined for reserved types: %s', constructor => {
                expect(TypeRef.predicateForType(constructor))
                    .toBeUndefined();
            });


            it('success', () => {
                const definition = Definition.create()
                    .markType(Foo);

                expect(TypeRef.predicateForType(Foo)!(definition))
                    .toEqual(true);
            })

        })
    });

    describe('checking if type is reserved', () => {
        it.each([
            [Foo],
            [Bar],
            [RegExp]
        ])('success: %s', constructor => {
            expect(TypeRef.isAllowedTarget(constructor))
                .toEqual(true);
        });

        it.each(RESERVED_TYPES)('failed: %s', constructor => {
            expect(TypeRef.isAllowedTarget(constructor))
                .toEqual(false);
        });
    });
});