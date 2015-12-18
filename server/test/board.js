var assert = require('chai').assert;
var Helper = require('./helpers/helper');
var co = require('co');
var _ = require('lodash');

describe('board', function() {
    /**
     * @type {Helper}
     */
    var helper;

    beforeEach(function(done) {
        helper = new Helper();
        helper.startup().then(function() {
            done();
        });
    });

    afterEach(function(done) {
        helper.teardown().then(function() {
            done();
        });
    });
});