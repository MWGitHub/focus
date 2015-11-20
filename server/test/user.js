var assert = require('chai').assert;
var Helper = require('./helpers/helper');
var co = require('co');
var moment = require('moment-timezone');

describe('user', function() {
    var testUser = {
        username: 'test',
        password: 'testpw',
        email: 'something@example.com',
        timezone: moment.tz.names()[0]
    };

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

    it('should create a valid user', function(done) {
        co(function* () {
            // Test standard user with all inputs given
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/users',
                payload: {
                    username: testUser.username,
                    password: testUser.password,
                    email: testUser.email,
                    timezone: testUser.timezone
                }
            };

            var response = yield helper.inject(payload);
            var attributes = response.result.data.attributes;
            assert.equal(response.statusCode, 200);
            assert.equal(attributes.username, testUser.username);
            assert.equal(attributes.email, testUser.email);
            assert.equal(attributes.timezone, testUser.timezone);
            assert.notOk(attributes.verified);

            // Test without email
            delete payload.payload['email'];
            payload.payload.username = 'test2';
            response = yield helper.inject(payload);
            attributes = response.result.data.attributes;
            assert.equal(response.statusCode, 200);
            assert.equal(attributes.username, 'test2');
            assert.notOk(attributes.email);
            assert.equal(attributes.timezone, testUser.timezone);
            assert.notOk(attributes.verified);

            // Test without timezone
            delete payload.payload['timezone'];
            payload.payload.username = 'test3';
            response = yield helper.inject(payload);
            attributes = response.result.data.attributes;
            assert.equal(response.statusCode, 200);
            assert.equal(attributes.username, 'test3');
            assert.notOk(attributes.email);
            assert.ok(attributes.timezone, testUser.timezone);
            assert.notOk(attributes.verified);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not create a user with invalid inputs', function(done) {
        assert(false);
        done();
    });

    it('should not allow duplicate users', function(done) {
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