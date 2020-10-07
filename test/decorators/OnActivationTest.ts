import {onActivation, Service} from "@src/.";
import {getDefinitionForClass} from "@src/decorators/Service";
import {OnActivation} from "@src/decorators/OnActivation";

describe('OnActivation', () => {
    it('defines annotation', () => {
        const func = function() {};
        @Service()
        @OnActivation(func)
        class Foo {

        }

        const definition = getDefinitionForClass(Foo);
        const annotation = onActivation(func);
        expect(definition.annotations)
            .toEqual([annotation]);
    })
});