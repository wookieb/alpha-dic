import {Middleware} from "../../src/types";
import {ConfigProvider} from "../../src/ConfigProvider";
import * as sinon from 'sinon';
import {configMiddleware} from "../../src/middlewares/config";
import {Definition} from "../../src/Definition";
import {ConfigRequest} from "../../src/ConfigRequest";
import {SinonStub} from "sinon";
import {assert} from 'chai';
import {Reference} from "../../src/Reference";

describe('configMiddleware', () => {

    let middleware: Middleware;
    let configProvider: ConfigProvider;
    let next: sinon.SinonStub;

    const service = {foo: 'bar'};

    const CONFIG_REQUEST = ConfigRequest.create('path');
    const CONFIG_VALUE = 'config-value';

    beforeEach(() => {
        configProvider = sinon.stub();

        (<SinonStub>configProvider).withArgs(CONFIG_REQUEST).returns(CONFIG_VALUE);

        middleware = configMiddleware(configProvider);
        next = sinon.stub().returns(service);
    });

    it('modifies definition if contains any arguments with config request', () => {
        const definition = Definition.create('foo')
            .withArgs(CONFIG_REQUEST);

        const result = middleware(definition, next);
        assert.strictEqual(result, service);

        sinon.assert.calledWith(
            next,
            sinon.match(
                Definition.create('foo')
                    .withArgs(CONFIG_VALUE)
            )
        );
    });

    it('leaves non ConfigRequest arguments', () => {

        const reference = Reference.one.name('bar');
        const definition = Definition.create('foo')
            .withArgs('regular', reference, CONFIG_REQUEST);

        const result = middleware(definition, next);
        assert.strictEqual(result, service);

        sinon.assert.calledWith(
            next,
            sinon.match(
                Definition.create('foo')
                    .withArgs('regular', reference, CONFIG_VALUE)
            )
        );
    });

    it('definition without ConfigRequest remains unchanged and forwarded', () => {
        const reference = Reference.one.name('bar');
        const definition = Definition.create('foo')
            .withArgs('regular', reference);

        const result = middleware(definition, next);
        assert.strictEqual(result, service);

        sinon.assert.calledWith(
            next,
            sinon.match.same(definition)
        );
    });
});