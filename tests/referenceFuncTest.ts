import {assert} from 'chai';
import {reference} from "../src/referenceFunc";
import {Reference} from "../src/Reference";

describe('referenceFunc', () => {

    const PREDICATE = () => true;

    it('main function', () => {
        assert.deepEqual(
            reference('name'),
            Reference.one.name('name')
        );
    });

    it('one by predicate', () => {
        assert.deepEqual(
            reference.predicate(PREDICATE),
            Reference.one.predicate(PREDICATE)
        );
    });

    it('on by annotation', () => {
        assert.deepEqual(
            reference.annotation(PREDICATE),
            Reference.one.annotation(PREDICATE)
        );
    });

    it('multi by predicate', () => {
        assert.deepEqual(
            reference.multi.predicate(PREDICATE),
            Reference.multi.predicate(PREDICATE)
        );
    });

    it('multi by annotation', () => {
        assert.deepEqual(
            reference.multi.annotation(PREDICATE),
            Reference.multi.annotation(PREDICATE)
        );
    });
});