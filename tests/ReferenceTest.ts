import {assert} from 'chai';
import {Container} from "../src/Container";
import {Reference} from "../src/Reference";
import {Definition} from "../src/Definition";

describe('Reference', () => {
    let container: Container;

    const serviceA = {service: 'A'};
    const serviceB = {service: 'B'};

    const ANNOTATION_NAME = 'annotationName';
    const ANNOTATION = {name: 'ExtraAnnotation'};
    const AMBIGUOUS_ANNOTATION = 'annotationName2';

    beforeEach(() => {
        container = new Container();

        container.definition('A')
            .useValue(serviceA)
            .annotate(ANNOTATION_NAME)
            .annotate(AMBIGUOUS_ANNOTATION);

        container.definition('B')
            .useValue(serviceB)
            .annotate(ANNOTATION)
            .annotate(AMBIGUOUS_ANNOTATION);
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
            }, /Multiple services found \(A, B\)/)
        });

        it('by annotation name', async () => {
            const ref = Reference.one.annotation(ANNOTATION_NAME);
            assert.strictEqual(ref.getDependentServices(container), container.findByName('A'));
            assert.strictEqual(await ref.getArgument(container), serviceA);
        });

        it('by annotation name - not found', async () => {
            const ref = Reference.one.annotation('non-existing-annotation');
            assert.throws(() => {
                ref.getDependentServices(container);
            }, /No matching service/);
        });

        it('by annotation name - ambiguous error', () => {
            const ref = Reference.one.annotation(AMBIGUOUS_ANNOTATION);
            assert.throws(() => {
                ref.getDependentServices(container);
            }, /Multiple services found \(A, B\)/)
        });

        it('by annotation predicate', async () => {
            const ref = Reference.one.annotationPredicate(a => a === ANNOTATION);

            assert.strictEqual(ref.getDependentServices(container), container.findByName('B'));
            assert.strictEqual(await ref.getArgument(container), serviceB);
        });

        it('by annotation predicate - not found', async () => {
            const ref = Reference.one.annotationPredicate(() => false);

            assert.throws(() => {
                ref.getDependentServices(container);
            }, /No matching service/);
        });

        it('by annotation predicate - ambiguous error', async () => {
            const ref = Reference.one.annotationPredicate(() => true);

            assert.throws(() => {
                ref.getDependentServices(container);
            }, /Multiple services found \(A, B\)/)
        });
    });

    describe('multi', () => {
        it('by annotation', async () => {
            const ref = Reference.multi.annotation(AMBIGUOUS_ANNOTATION);

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
            const ref = Reference.multi.annotation('non-existing-annotation');

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

        it('by annotation predicate', async () => {
            const ref = Reference.multi.annotationPredicate((a) => a.name === ANNOTATION_NAME);
            assert.sameMembers(<Definition[]>ref.getDependentServices(container), [
                container.findByName('A')
            ]);
            assert.sameMembers(await ref.getArgument(container), [
                serviceA
            ]);
        });

        it('by annotation predicate - nothing found', async () => {
            const ref = Reference.multi.annotationPredicate(() => false);
            assert.sameMembers(<Definition[]>ref.getDependentServices(container), []);
            assert.sameMembers(await ref.getArgument(container), []);
        });
    });
});