import {Config} from "../../src/decorators/Config";
import {Service} from "../../src/decorators/Service";
import {assert} from 'chai';
import {ensureMetadata} from "../../src/serviceMetadata";
import {ConfigRequest} from "../../src/ConfigRequest";

describe('Config', () => {
    it('injects parameter to constructor', () => {
        @Service()
        class Foo {
            constructor(@Config('path') parameter: any, @Config('path2', 'default') parameter2: any) {

            }
        }

        const metadata = ensureMetadata(Foo);
        assert.deepNestedPropertyVal(
            metadata,
            'constructorArguments.0',
            new ConfigRequest('path')
        );

        assert.deepNestedPropertyVal(
            metadata,
            'constructorArguments.1',
            new ConfigRequest('path2', 'default')
        );
    });

    it('injects parameters to property', () => {
        @Service()
        class Foo {
            @Config('path')
            property: string;

            @Config('path2', 'default')
            property2: string;
        }

        const metadata = ensureMetadata(Foo);
        assert.deepEqual(metadata.propertiesInjectors.get('property'), new ConfigRequest('path'));
        assert.deepEqual(metadata.propertiesInjectors.get('property2'), new ConfigRequest('path2', 'default'));
    });
});