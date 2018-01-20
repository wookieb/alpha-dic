import {configProviderForObject} from "../src/ConfigProvider";
import {assert} from 'chai';
import {ConfigRequest} from "../src/ConfigRequest";

describe('configProviderForObject', () => {
    const provider = configProviderForObject({
        foo: 'bar',
        nested: {
            foo: 'zar',
            nested2: {
                foo: 'car'
            }
        }
    });

    const DEFAULT = 'defaultValue';

    it('getting by simple path', () => {
        assert.strictEqual(provider(new ConfigRequest('foo')), 'bar');
        assert.strictEqual(provider(new ConfigRequest('foo', DEFAULT)), 'bar');
        assert.strictEqual(provider(new ConfigRequest('bar', DEFAULT)), DEFAULT);
    });

    it('getting at nested path', () => {
        assert.strictEqual(provider(new ConfigRequest('nested.foo')), 'zar');
        assert.strictEqual(provider(new ConfigRequest('nested.foo', DEFAULT)), 'zar');
        assert.strictEqual(provider(new ConfigRequest('nested.bar', DEFAULT)), DEFAULT);
    });

    it('getting as double nested path', () => {
        assert.strictEqual(provider(new ConfigRequest('nested.nested2.foo')), 'car');
        assert.strictEqual(provider(new ConfigRequest('nested.nested2.foo', DEFAULT)), 'car');
        assert.strictEqual(provider(new ConfigRequest('nested.nested2.bar', DEFAULT)), DEFAULT);
    });

    it('fails if config not defined and no default value set', () => {
        assert.throws(() => {
            provider(new ConfigRequest('bar'));
        }, /Config at path "bar" is not defined/)
    });

});