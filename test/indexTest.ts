import {config, Container, create, createStandard, Definition, deprecated, onActivation} from "@src/.";
import * as sinon from 'sinon';

describe('index', () => {
    describe('standard container', () => {
        it('all options', async () => {
            const CONFIG = {some: 'config'};
            const NOTE = 'deprecation note';
            const SERVICE = {a: 'service'};
            const deprecationMessageFunc = sinon.spy();

            const container = createStandard({
                config: CONFIG,
                deprecationMessageFunc: deprecationMessageFunc
            });

            const activationHook = sinon.stub().resolves(SERVICE);
            const factory = sinon.stub().resolves(SERVICE);

            const definition = new Definition('foo');
            definition.useFactory(factory);
            definition.withArgs(config('some'));
            definition.annotate(onActivation(activationHook));
            definition.annotate(deprecated(NOTE));

            container.registerDefinition(definition);

            const service = await container.get(definition.name);

            expect(service)
                .toEqual(SERVICE);
            sinon.assert.calledWith(factory, CONFIG.some);
            sinon.assert.calledWith(activationHook, SERVICE);
            sinon.assert.calledWith(deprecationMessageFunc, `Service foo is deprecated: ${NOTE}`);
        });
    });


    it('simple create', () => {
        const container = create();
        expect(container)
            .toBeInstanceOf(Container);
    });
});