'use strict';

const assert = require('chai').assert;

const Service = require('../src/Service');

describe('Service', () => {
    let service;
    
    beforeEach(() => {
        service = new Service('some-name');
    });
    
    it('defining name', () => {
        assert.strictEqual(service.name, 'some-name');
    });
    
    it('defining dependencies', () => {
        assert.strictEqual(service.dependsOn('a', 'b', 'c'), service, 'Broken method chaining for "dependsOn" method');
        assert.deepEqual(service.dependencies, ['a', 'b', 'c']);
    });
    
    it('defining dependencies as array', () => {
        assert.strictEqual(service.dependsOn(['a', 'b', 'c']), service, 'Broken method chaining for "dependsOn" method');
        assert.deepEqual(service.dependencies, ['a', 'b', 'c']);
    });
    
    describe('setting annotations', () => {
        it('without properties', () => {
            assert.strictEqual(service.annotate('name'), service, 'Broken method chaining for "annotate"');
            assert.deepEqual(service.annotations, {name: {}});
        });
        
        it('with properties', () => {
            assert.strictEqual(service.annotate('name', {some: 'property'}), service, 'Broken method chaining for "annotate"');
            assert.deepEqual(service.annotations, {name: {some: 'property'}});
        });
        
        it('via object', () => {
            const annotation = {name: 'annotation', withProperties: 1};
            assert.strictEqual(service.annotate(annotation), service, 'Broken method chaining for "annotate"');
            assert.deepEqual(service.annotations, {annotation: annotation});
        });
        
        it('fails if no name provided', () => {
            assert.throws(() => {
                    service.annotate('');
                },
                /Annotation name has to be string or annotation object/
            );
        });
        
        it('fails for annotation objects without name property', () => {
            assert.throws(() => {
                    service.annotate({some: 'property'});
                },
                /Annotation object requires non-empty "name" property/
            );
        });
    });
    
    it('setting constructor value', () => {
        service.useConstructor(Error);
        
        assert.strictEqual(service.type, Service.TYPE_CONSTRUCTOR);
        assert.strictEqual(service.value, Error);
    });
    
    it('setting factory value', () => {
        const NOOP = () => ({});
        service.useFactory(NOOP);
        
        assert.strictEqual(service.type, Service.TYPE_FACTORY);
        assert.strictEqual(service.value, NOOP);
    });
    
    it('setting async factory value', () => {
        const NOOP = () => ({});
        service.useAsyncFactory(NOOP);
        
        assert.strictEqual(service.type, Service.TYPE_ASYNC_FACTORY);
        assert.strictEqual(service.value, NOOP);
    });
    
    it('setting anything as value', () => {
        const VALUE = Math.random();
        service.useValue(VALUE);
        
        assert.strictEqual(service.type, Service.TYPE_VALUE);
        assert.strictEqual(service.value, VALUE);
    });
    
    it('cacheable by default', () => {
        assert.ok(service.cacheable);
    });
    
    it('turning into non-cacheable', () => {
        service.nonCacheable();
        
        assert.notOk(service.cacheable);
    });
    
    it('hasAnnotation', () => {
        service.annotate('empty')
            .annotate('non-empty', {property: 1});
        
        assert.ok(service.hasAnnotation('empty'));
        assert.ok(service.hasAnnotation('non-empty'));
        assert.notOk(service.hasAnnotation('exotic-annotation'));
    });
    
    it('getAnnotation', () => {
        const annotationProperties = {property: 1};
        service.annotate('empty')
            .annotate('non-empty', annotationProperties);
        
        assert.deepEqual(service.getAnnotation('empty'), {});
        assert.strictEqual(service.getAnnotation('non-empty'), annotationProperties);
        assert.isUndefined(service.getAnnotation('exotic-annotation'));
    });
});