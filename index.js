'use strict';

const AlphaDIC = require('./src/AlphaDIC');
const Service = require('./src/Service');

exports.create = function() {
    return new AlphaDIC();
};

exports.AlphaDIC = AlphaDIC;
exports.Service = Service;