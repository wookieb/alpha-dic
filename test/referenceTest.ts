import {reference} from "@src/reference";
import {ReferenceArg} from "@src/args/ReferenceArg";

describe('reference', () => {
    const PREDICATE = () => true;
    it('main function', () => {
        expect(reference('name'))
            .toEqual(ReferenceArg.one.name('name'))
    });

    it('one by predicate', () => {
        expect(reference.predicate(PREDICATE))
            .toEqual(ReferenceArg.one.predicate(PREDICATE));
    });

    it('on by annotation', () => {
        expect(reference.annotation(PREDICATE))
            .toEqual(ReferenceArg.one.annotation(PREDICATE));
    });

    it('multi by predicate', () => {
        expect(reference.multi.predicate(PREDICATE))
            .toEqual(ReferenceArg.multi.predicate(PREDICATE))
    });

    it('multi by annotation', () => {
        expect(reference.multi.annotation(PREDICATE))
            .toEqual(ReferenceArg.multi.annotation(PREDICATE))
    });
});