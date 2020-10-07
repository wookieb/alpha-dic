import {Container} from "@src/Container";
import {ReferenceArg} from "@src/args/ReferenceArg";
import {TypeRef} from "@src/TypeRef";

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
            const ref = ReferenceArg.one.name('A');
            expect(ref.getDependentServices(container))
                .toEqual(container.findByName('A'));

            expect(await ref.getArgument(container))
                .toEqual(serviceA);
        });

        it('by name - not found', () => {
            const ref = ReferenceArg.one.name('C');
            expect(() => {
                ref.getDependentServices(container);
            })
                .toThrowError(/No matching service/);
        });

        it('by predicate', async () => {
            const ref = ReferenceArg.one.predicate(d => d.name === 'B');

            expect(ref.getDependentServices(container))
                .toEqual(container.findByName('B'));

            expect(await ref.getArgument(container))
                .toEqual(serviceB);
        });

        it('by predicate - not found', () => {
            const ref = ReferenceArg.one.predicate(() => false);

            expect(() => {
                ref.getDependentServices(container);
            })
                .toThrowError(/No matching service/);
        });

        it('by predicate - ambiguous error', () => {
            const ref = ReferenceArg.one.predicate(() => true);

            expect(() => {
                ref.getDependentServices(container);
            })
                .toThrowError(/Multiple services found \(A, B, D\)/);
        });

        it('by annotation', async () => {
            const ref = ReferenceArg.one.annotation(a => a.name === ANNOTATION_NAME);

            expect(ref.getDependentServices(container))
                .toEqual(container.findByName('A'));

            expect(await ref.getArgument(container))
                .toEqual(serviceA);
        });

        it('by annotation - not found', () => {
            const ref = ReferenceArg.one.annotation(() => false);

            expect(() => {
                ref.getDependentServices(container);
            })
                .toThrowError(/No matching service/);
        });

        it('by annotation- ambiguous error', () => {
            const ref = ReferenceArg.one.annotation(a => a.name === AMBIGUOUS_ANNOTATION.name);

            expect(() => {
                ref.getDependentServices(container);
            })
                .toThrowError(/Multiple services found \(A, B\)/);
        });

        it('by type', () => {
            const ref = ReferenceArg.one.type(TypeRef.createFromType(A)!)

            expect(ref.getDependentServices(container))
                .toEqual(container.findByName('A'));
        });

        it('by type - ambiguous error', () => {
            const ref = ReferenceArg.one.type(TypeRef.createFromType(B)!)
            expect(() => {
                ref.getDependentServices(container)
            })
                .toThrowErrorMatchingSnapshot();
        })
    });

    describe('multi', () => {
        it('by annotation', async () => {
            const ref = ReferenceArg.multi.annotation(a => a.name === AMBIGUOUS_ANNOTATION.name);

            expect(ref.getDependentServices(container))
                .toEqual([
                    container.findByName('A'),
                    container.findByName('B')
                ])

            expect(await ref.getArgument(container))
                .toEqual([serviceA, serviceB]);
        });

        it('by annotation - nothing found', async () => {
            const ref = ReferenceArg.multi.annotation(() => false);

            expect(ref.getDependentServices(container))
                .toHaveLength(0);

            expect(await ref.getArgument(container))
                .toHaveLength(0);
        });

        it('by predicate', async () => {
            const ref = ReferenceArg.multi.predicate(d => d.name === 'A');

            expect(ref.getDependentServices(container))
                .toEqual([
                    container.findByName('A')
                ])

            expect(await ref.getArgument(container))
                .toEqual([serviceA]);
        });

        it('by predicate - nothing found', async () => {
            const ref = ReferenceArg.multi.predicate(() => false);

            expect(ref.getDependentServices(container))
                .toHaveLength(0);
            expect(await ref.getArgument(container))
                .toHaveLength(0);
        });

        it('by type', () => {
            const ref = ReferenceArg.multi.type(TypeRef.createFromType(B)!)

            expect(ref.getDependentServices(container))
                .toEqual([
                    container.findByName('B'),
                    container.findByName('D')
                ]);
        });
    });
});