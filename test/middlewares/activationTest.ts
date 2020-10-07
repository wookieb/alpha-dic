import {Container} from "@src/Container";
import {activationMiddleware, onActivation} from "@src/middlewares/activation";
import * as sinon from 'sinon';

describe('activation', () => {
    const factoryResult = {foo: 'bar'};
    let container: Container;
    let factory: sinon.SinonStub;

    beforeEach(() => {
        container = new Container();
        container.addMiddleware(activationMiddleware);

        factory = sinon.stub();
        factory.returns(factoryResult);

        container.definitionWithFactory('A', factory);
    });

    it('call on activation hook after service gets created', async () => {
        const hook = sinon.stub().returnsArg(0);

        container.findByName('A')!
            .annotate(onActivation(hook));

        const result = await container.get('A');

        expect(result).toStrictEqual(factoryResult);

        sinon.assert.calledOn(hook, container);
        sinon.assert.calledWithExactly(hook, factoryResult);
        sinon.assert.callOrder(factory, hook);
    });

    it('properly handles non-promise result from next function', () => {
        container.addMiddleware(() => {
            return factoryResult;
        });

        const promise = container.get('A');

        expect(promise).toBeInstanceOf(Promise);
        return expect(promise)
            .resolves
            .toEqual(factoryResult);
    });

    it('multiple hooks', async () => {
        const hook1 = sinon.stub().resolves(1);
        const hook2 = sinon.stub().returns(2);
        const hook3 = sinon.stub().returns(3);

        container.findByName('A')!
            .annotate(onActivation(hook1))
            .annotate(onActivation(hook2))
            .annotate(onActivation(hook3));


        const result = await container.get('A');

        expect(result).toEqual(3);

        sinon.assert.calledWith(hook1, factoryResult);
        sinon.assert.calledWith(hook2, 1);
        sinon.assert.calledWith(hook3, 2);

        sinon.assert.callOrder(hook1, hook2, hook3);
    });
});