import {assert} from 'chai';
import {Container} from "../src/Container";
import {Reference} from "../src/Reference";
import {Definition} from "../src/Definition";
import {TypeRef} from "../src/TypeRef";

describe('Reference', () => {
    let container: Container;

    const serviceA = {service: 'A'};
    const serviceB = {service: 'B'};
    const serviceD = {service: 'D'};

    const ANNOTATION_NAME = 'annotationName';
    const ANNOTATION = {name: 'ExtraAnnotation'};
    const AMBIGUOUS_ANNOTATION = {name: 'ambiguous'};

    class A {}

    class B {}

    class D extends B {}

    beforeEach(() => {
        container = new Container();

        container.definition('A')
            .useValue(serviceA)
            .markType(A)
            .annotate({name: ANNOTATION_NAME})
            .annotate(AMBIGUOUS_ANNOTATION);

        container.definition('B')
            .useValue(serviceB)
            .markType(B)
            .annotate(ANNOTATION)
            .annotate(AMBIGUOUS_ANNOTATION);

        container.definition('D')
            .useValue(serviceD)
            .markType(D);
    });

    describe('one', () => {
        it('by name', async () => {
            const ref = Reference.one.name('A');
            assert.strictEqual(ref.getDependentServices(container), container.findByName('A'));
            assert.strictEqual(await ref.getArgument(container), serviceA);
        });

        it('by name - not found', () => {
            const ref = Reference.one.name('C');
            assert.throws(() => {
                ref.getDependentServices(container);
            }, /No matching service/);
        });

        it('by predicate', async () => {
            const ref = Reference.one.predicate(d => d.name === 'B');

            assert.strictEqual(ref.getDependentServices(container), container.findByName('B'));
            assert.strictEqual(await ref.getArgument(container), serviceB);
        });

        it('by predicate - not found', () => {
            const ref = Reference.one.predicate(() => false);
            assert.throws(() => {
                ref.getDependentServices(container);
            }, /No matching service/);
        });

        it('by predicate - ambiguous error', () => {
            const ref = Reference.one.predicate(() => true);
            assert.throws(() => {
                ref.getDependentServices(container);
            }, /Multiple services found \(A, B, D\)/)
        });

        it('by annotation', async () => {
            const ref = Reference.one.annotation((a) => a.name === ANNOTATION_NAME);
            assert.strictEqual(ref.getDependentServices(container), container.findByName('A'));
            assert.strictEqual(await ref.getArgument(container), serviceA);
        });

        it('by annotation - not found', async () => {
            const ref = Reference.one.annotation(() => false);
            assert.throws(() => {
                ref.getDependentServices(container);
            }, /No matching service/);
        });

        it('by annotation- ambiguous error', () => {
            const ref = Reference.one.annotation(a => a.name === AMBIGUOUS_ANNOTATION.name);
            assert.throws(() => {
                ref.getDependentServices(container);
            }, /Multiple services found \(A, B\)/)
        });

        it('by type', () => {
            const ref = Reference.one.type(TypeRef.createFromType(A))

            expect(ref.getDependentServices(container))
                .toEqual(container.findByName('A'));
        });

        it('by type - ambiguous error', () => {
            const ref = Reference.one.type(TypeRef.createFromType(B))
            expect(() => {
                ref.getDependentServices(container)
            })
                .toThrowErrorMatchingSnapshot();
        })
    });

    describe('multi', () => {
        it('by annotation', async () => {
            const ref = Reference.multi.annotation(a => a.name === AMBIGUOUS_ANNOTATION.name);

            assert.sameMembers(<Definition[]>ref.getDependentServices(container), [
                container.findByName('A'),
                container.findByName('B')
            ]);

            assert.sameMembers(
                await ref.getArgument(container),
                [serviceA, serviceB]
            );
        });

        it('by annotation - nothing found', async () => {
            const ref = Reference.multi.annotation(() => false);

            assert.sameMembers(<Definition[]>ref.getDependentServices(container), []);
            assert.sameMembers(await ref.getArgument(container), []);
        });

        it('by predicate', async () => {
            const ref = Reference.multi.predicate(d => d.name === 'A');

            assert.sameMembers(<Definition[]>ref.getDependentServices(container), [
                container.findByName('A')
            ]);

            assert.sameMembers(
                await ref.getArgument(container),
                [serviceA]
            );
        });

        it('by predicate - nothing found', async () => {
            const ref = Reference.multi.predicate(() => false);

            assert.sameMembers(<Definition[]>ref.getDependentServices(container), []);
            assert.sameMembers(await ref.getArgument(container), []);
        });

        it('by type', () => {
            const ref = Reference.multi.type(TypeRef.createFromType(B))

            expect(ref.getDependentServices(container))
                .toEqual([
                    container.findByName('B'),
                    container.findByName('D')
                ]);
        });
    });
});