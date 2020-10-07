import {Container} from "@src/Container";
import {configMiddleware} from "@src/middlewares/config";
import {configProviderForObject} from "@src/ConfigProvider";
import {activationMiddleware} from "@src/middlewares/activation";
import {Config} from "@src/decorators/Config";
import {getDefinitionForClass, Service} from "@src/decorators/Service";
import {Inject} from "@src/decorators/Inject";
import {config} from "@src/config";
import {reference} from "@src/reference";

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

            constructor(@Config('database') public mongo: string,
                        @Inject('extraService') public extraService: any) {

            }
        }

        container.registerDefinition(getDefinitionForClass(Foo));
        const service = await container.get(getDefinitionForClass(Foo).name);

        expect(service.mongo)
            .toEqual(CONFIG.database);

        expect(service.redis)
            .toEqual(CONFIG.redis);

        expect(service.extraService)
            .toEqual(extraService);

        expect(service)
            .toBeInstanceOf(Foo);
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

        expect(service.redis)
            .toEqual(CONFIG.redis);

        expect(service.extraService)
            .toEqual(extraService);

        expect(service.requiresAuth)
            .toEqual(false);
    });
});