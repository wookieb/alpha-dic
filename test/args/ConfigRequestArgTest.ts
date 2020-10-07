import {ConfigRequestArg} from "@src/args/ConfigRequestArg";
import {config} from "@src/config";
import {configMiddleware} from "@src/middlewares/config";
import {configProviderForObject} from "@src/ConfigProvider";
import {ContainerArg} from "@src/args/ContainerArg";
import {Container, create} from "@src/index";

describe('ConfigRequestArg', () => {
    const PATH = 'at.path';

    it('is ContainerArg', () => {
        expect(new ConfigRequestArg(PATH))
            .toBeInstanceOf(ContainerArg);
    });

    it('creating with default value', () => {
        const defaultValue = {foo: 'bar'};
        const request = new ConfigRequestArg(PATH, defaultValue);

        expect(request)
            .toMatchObject({
                path: PATH,
                hasDefaultValue: true,
                defaultValue
            });

        expect(Object.isFrozen(request))
            .toBe(true);
    });

    it('creating without default value', () => {
        const request = new ConfigRequestArg(PATH);

        expect(request)
            .toMatchObject({
                path: PATH,
                hasDefaultValue: false,
                defaultValue: undefined
            })

        expect(Object.isFrozen(request))
            .toBe(true);
    });

    it('path cannot be empty', () => {
        expect(() => {
            // tslint:disable-next-line:no-unused-expression
            new ConfigRequestArg('  ');
        })
            .toThrowError(/Config "path" cannot be blank/);
    });

    it('undefined as default value', () => {
        const request = new ConfigRequestArg(PATH, undefined);

        expect(request)
            .toMatchObject({
                path: PATH,
                hasDefaultValue: true,
                defaultValue: undefined
            });
    });

    it('ConfigRequestArg.create', () => {
        expect(ConfigRequestArg.create('path'))
            .toEqual(new ConfigRequestArg('path'))

        expect(ConfigRequestArg.create('path', 'withDefaultValue'))
            .toEqual(new ConfigRequestArg('path', 'withDefaultValue'));

        expect(ConfigRequestArg.create('path', undefined))
            .toEqual(new ConfigRequestArg('path', undefined));
    });

    describe('as argument', () => {
        const REQUEST = config('foo');
        const MIDDLEWARE = configMiddleware(configProviderForObject({foo: 'bar'}));

        let container: Container;
        beforeEach(() => {
            container = create();
        });

        it('resolves to config', () => {
            container.addMiddleware(MIDDLEWARE);
            return expect(REQUEST.getArgument(container))
                .resolves
                .toEqual('bar');
        });

        it('has no dependencies', () => {
            container.addMiddleware(MIDDLEWARE);
            expect(REQUEST.getDependentServices(container))
                .toEqual([]);
        });
    });
});