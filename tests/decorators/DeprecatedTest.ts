import {deprecated, Deprecated, Service} from "../../src";
import {getDefinitionForClass} from "../../src/decorators/Service";
import {assert} from 'chai';


describe('Deprecated', () => {
    const NOTE = 'Some deprecation note';

    it('adding to a class', () => {
        @Deprecated(NOTE)
        @Service()
        class SomeClass {

        }

        const definition = getDefinitionForClass(SomeClass);
        const annotation = deprecated(NOTE);
        assert.includeDeepMembers([annotation], definition.annotations);
    });
});