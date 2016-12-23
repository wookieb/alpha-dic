'use strict';

const assert = require('chai').assert;

const Service = require('../src/Service');

describe('Service', () => {
    it('defining name', () => {
        const service = new Service('some-name');
        assert.strictEqual(service.name, 'some-name');
    });
    
    it('defining dependencies', () => {
        const service = new Service('test');
        assert.strictEqual(service.dependsOn('a', 'b', 'c'), service, 'Broken method chaining for "dependsOn" method');
        assert.deepEqual(service.dependencies, ['a', 'b', 'c']);
    });
    
    it('defining dependencies as array', () => {
        const service = new Service('test');
        assert.strictEqual(service.dependsOn(['a', 'b', 'c']), service, 'Broken method chaining for "dependsOn" method');
        assert.deepEqual(service.dependencies, ['a', 'b', 'c']);
    });
    
    it('setting annotations without properties', () => {
        const service = new Service('test');
        assert.strictEqual(service.annotate('name'), service, 'Broken method chaining for "setAnnotations"');
        assert.deepEqual(service.annotations, {name: {}});
    });
    
    it('setting annotations with properties', () => {
        const service = new Service('test');
        assert.strictEqual(service.annotate('name', {some: 'property'}), service, 'Broken method chaining for "setAnnotations"');
        assert.deepEqual(service.annotations, {name: {some: 'property'}});
    });
    
    it('setting constructor function', () => {
        const service = new Service('test');
        service.useConstructor(Error);
        
        assert.strictEqual(service.type, Service.TYPE_CONSTRUCTOR);
        assert.strictEqual(service.function, Error);
    });
    
    it('setting factory function', () => {
        const NOOP = () => ({});
        const service = new Service('test');
        service.useFactory(NOOP);
        
        assert.strictEqual(service.type, Service.TYPE_FACTORY);
        assert.strictEqual(service.function, NOOP);
    });
    
    it('setting async factory function', () => {
        const NOOP = () => ({});
        const service = new Service('test');
        service.useAsyncFactory(NOOP);
        
        assert.strictEqual(service.type, Service.TYPE_ASYNC_FACTORY);
        assert.strictEqual(service.function, NOOP);
    });
    
    it('cacheable by default', () => {
        const service = new Service('test');
        assert.ok(service.cacheable);
    });
    
    it('turning into non-cacheable', () => {
        const service = new Service('test');
        
        service.nonCacheable();
        
        assert.notOk(service.cacheable);
    });
    
    it('hasAnnotation', () => {
        const service = new Service('test');
        service.annotate('empty')
            .annotate('non-empty', {property: 1});
        
        assert.ok(service.hasAnnotation('empty'));
        assert.ok(service.hasAnnotation('non-empty'));
        assert.notOk(service.hasAnnotation('exotic-annotation'));
    });
    
    it('getAnnotation', () => {
        const service = new Service('test');
        const annotationProperties = {property: 1};
        service.annotate('empty')
            .annotate('non-empty', annotationProperties);
        
        assert.deepEqual(service.getAnnotation('empty'), {});
        assert.strictEqual(service.getAnnotation('non-empty'), annotationProperties);
        assert.isUndefined(service.getAnnotation('exotic-annotation'));
    });
});