var Session = require('../src/auth/session');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var assert = require('chai').assert;
var Server = require('../src/server');

describe('session', function() {
    before(function(done) {
        Server.start().then(function(server) {
            done();
        });
    });

    it('should fail to validate an unknown session', function(done) {
        Session.validate('123').then(function(v) {
            assert.notOk(v);
            done();
        });
    });

    it('should generate a token from an id', function(done) {
        var token = Session.generateToken(1);
        assert.ok(token);
        done();
    });

    it('should decode a token with an id', function(done) {
        var token = Session.generateToken(100);
        assert.ok(token);
        var decoded = Session.decodeToken(token);
        assert.equal(decoded.data.id, 100);
        done();
    });

    it('should log in and validate a session then log out and fail validation', function(done) {
        var id = 1;
        var token = Session.generateToken(id);
        var parsed = Session.decodeToken(token);
        Session.login(token).then(function() {
            return Session.validate(parsed.data.tid);
        })
        .then(function(v) {
            assert.ok(v);
            return Session.logout(parsed.data.tid);
        })
        .then(function() {
            return Session.validate(parsed.data.tid);
        })
        .then(function(v) {
            assert.notOk(v);
            done();
        });
    });
});