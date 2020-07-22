import {Container} from "../src/Container";
import {configMiddleware} from "../src/middlewares/config";
import {configProviderForObject} from "../src/ConfigProvider";
import {activationMiddleware} from "../src/middlewares/activation";
import {Config} from "../src/decorators/Config";
import {getDefinitionForClass, Service} from "../src/decorators/Service";
import {assert} from 'chai';
import {Inject} from "../src/decorators/Inject";
import {config} from "../src/configFunc";
import {reference} from "../src/referenceFunc";

describe('integration', () => {
    const CONFIG = {
        database: 'mongo://localhost/test',
        redis: {
            user: 'username',
            password: '$secretPa##W0rd',
            host: 'my.redis.example.com',
            port: '8017'
        },
        env: process.env
    };

    let container: Container;

    const extraService = {foo: 'bar'};

    beforeEach(() => {
        container = new Container();

        container.addMiddleware(configMiddleware(
            configProviderForObject(CONFIG)
        ));
        container.addMiddleware(activationMiddleware);

        container.definitionWithValue('extraService', extraService);
    });

    it('service via decorators', async () => {
        @Service()
        class Foo {
            @Config('redis')
            redis: any;

            constructor(@Config('database') public mongo: string, @Inject('extraService') public extraService: any) {

            }
        }

        container.registerDefinition(getDefinitionForClass(Foo));
        const service = await container.get(getDefinitionForClass(Foo).name);

        assert.propertyVal(service, 'mongo', CONFIG.database);
        assert.propertyVal(service, 'redis', CONFIG.redis);
        assert.propertyVal(service, 'extraService', extraService);
        assert.instanceOf(service, Foo);
    });

    it('manually created service', async () => {
        container.definitionWithFactory('Foo', (redis: any, extraService: any, requiresAuth: boolean) => {
            return {
                redis,
                extraService,
                requiresAuth
            }
        })
            .withArgs(config('redis'), reference('extraService'), config('requiresAuth', false));

        const service = await container.get('Foo');
        assert.propertyVal(service, 'redis', CONFIG.redis);
        assert.propertyVal(service, 'extraService', extraService);
        assert.propertyVal(service, 'requiresAuth', false);
    });
});