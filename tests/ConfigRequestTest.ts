import {ConfigRequest} from "../src/ConfigRequest";
import {assert} from 'chai';

describe('ConfigRequest', () => {
    const PATH = 'at.path';

    it('creating with default value', () => {
        const defaultValue = {foo: 'bar'};
        const request = new ConfigRequest(PATH, defaultValue);

        assert.propertyVal(request, 'path', PATH);
        assert.propertyVal(request, 'hasDefaultValue', true);
        assert.propertyVal(request, 'defaultValue', defaultValue);
        assert.isTrue(Object.isFrozen(request));
    });

    it('creating without default value', () => {
        const request = new ConfigRequest(PATH);

        assert.propertyVal(request, 'path', PATH);
        assert.propertyVal(request, 'hasDefaultValue', false);
        assert.propertyVal(request, 'defaultValue', undefined);
        assert.isTrue(Object.isFrozen(request));
    });

    it('path cannot be empty', () => {
        assert.throws(() => {
            new ConfigRequest('  ');
        }, /Config "path" cannot be blank/)
    });

    it('undefined as default value', () => {
        const request = new ConfigRequest(PATH, undefined);

        assert.propertyVal(request, 'path', PATH);
        assert.propertyVal(request, 'hasDefaultValue', true);
        assert.propertyVal(request, 'defaultValue', undefined);
    });

    it('ConfigRequest.create', () => {
        assert.deepEqual(
            ConfigRequest.create('path'),
            new ConfigRequest('path')
        );

        assert.deepEqual(
            ConfigRequest.create('path', 'withDefaultValue'),
            new ConfigRequest('path', 'withDefaultValue')
        );

        assert.deepEqual(
            ConfigRequest.create('path', undefined),
            new ConfigRequest('path', undefined)
        );
    });
});