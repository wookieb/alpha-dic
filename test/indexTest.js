'use strict';

const index = require('../');
const assert = require('chai').assert;
const AlphaDIC = require('../src/AlphaDIC');
const Service = require('../src/Service');

describe('index', () => {
    it('create', () => {
        assert.deepEqual(index.create(), new AlphaDIC());
    });
    
    it('Service', () => {
        assert.strictEqual(index.Service, Service);
    });
    
    it('AlphaDIC', () => {
        assert.strictEqual(index.AlphaDIC, AlphaDIC);
    });
});