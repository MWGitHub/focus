var assert = require('chai').assert;
var Lab = require('lab');
var User = require('../src/models/user');
var Auth = require('../src/auth/auth');
var Session = require('../src/auth/session');
var API = require('../src/lib/api');
var Helper = require('./helpers/helper');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;

describe('user', function() {
    var server;

    beforeEach(function(done) {
        Helper.before().then(function(s) {
            server = s;
            done();
        })
    });

    afterEach(function(done) {
        Helper.after().then(function() {
            done();
        });
    });


    it('should create a valid user', function(done) {
        assert(false);
        done();
    });

    it('should not create a user with invalid inputs', function(done) {
        assert(false);
        done();
    });

    it('should hash the user\'s password', function(done) {
        assert(false);
        done();
    });

    it('should retrieve the user', function(done) {
        assert(false);
        done();
    });

    it('should update the user', function(done) {
        assert(false);
        done();
    });

    it('should delete the user', function(done) {
        assert(false);
        done();
    });
});