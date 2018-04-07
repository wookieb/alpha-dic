import {preloadServiceModules} from "../src/preloadServiceModules";
import {Container} from "../src";
import {assert} from 'chai';

describe('preloadServiceModules', () => {
    it('loads services for given files pattern', () => {
        const container = new Container();

        preloadServiceModules(container, './fixtures/servicesViaDecorators/test1_*.ts', {
            cwd: __dirname
        });

        assert.ok(container.findByName('Test1_Service1'));
        assert.ok(container.findByName('Test1_Service2'));
        assert.notOk(container.findByName('ExcludedService'));
    });

    it('multiple patterns', () => {
        const container = new Container();

        preloadServiceModules(container, [
            './fixtures/servicesViaDecorators/test2_service.ts',
            './fixtures/servicesViaDecorators/test2_service2.ts'
        ], {
            cwd: __dirname
        });

        assert.ok(container.findByName('Test2_Service1'));
        assert.ok(container.findByName('Test2_Service2'));
        assert.notOk(container.findByName('ExcludedService'));
    })
});