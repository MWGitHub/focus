var assert = require('chai').assert;
var Helper = require('./helpers/helper');
var co = require('co');
var moment = require('moment-timezone');
var _ = require('lodash');

describe('user', function() {
    var statusCodes = {
        valid: 200,
        error: 400,
        taken: 440
    };

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
            assert.equal(response.statusCode, statusCodes.valid);
            assert.equal(attributes.username, testUser.username);
            assert.equal(attributes.email, testUser.email);
            assert.equal(attributes.timezone, testUser.timezone);
            assert.notOk(attributes.verified);

            // Test without email
            delete payload.payload['email'];
            payload.payload.username = 'test2';
            response = yield helper.inject(payload);
            attributes = response.result.data.attributes;
            assert.equal(response.statusCode, statusCodes.valid);
            assert.equal(attributes.username, 'test2');
            assert.notOk(attributes.email);
            assert.equal(attributes.timezone, testUser.timezone);
            assert.notOk(attributes.verified);

            // Test without timezone
            delete payload.payload['timezone'];
            payload.payload.username = 'test3';
            response = yield helper.inject(payload);
            attributes = response.result.data.attributes;
            assert.equal(response.statusCode, statusCodes.valid);
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
        co(function* () {
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

            // Check for invalid usernames
            var clone = _.cloneDeep(payload);
            clone.payload.username = 'a';
            var response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            clone = _.cloneDeep(payload);
            clone.payload.username = '123456789012345678901234567890';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            clone = _.cloneDeep(payload);
            clone.payload.username = '12345-123!@#$%^&*';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            // Check for invalid passwords
            clone = _.cloneDeep(payload);
            clone.payload.password = 'a';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            clone = _.cloneDeep(payload);
            clone.payload.password = _.pad('', 100000, 'a');
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            // Check for invalid emails
            clone = _.cloneDeep(payload);
            clone.payload.email = 'a';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            clone = _.cloneDeep(payload);
            clone.payload.email = 'example.com';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            clone = _.cloneDeep(payload);
            clone.payload.email = '@test.org';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            // Check for valid timezones
            clone = _.cloneDeep(payload);
            clone.payload.timezone = 'a';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.error);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow duplicate users', function(done) {
        co(function* () {
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

            // Check if username is a duplicate
            yield helper.inject(payload);
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, statusCodes.taken);

            // Check if email is a duplicate
            var clone = _.cloneDeep(payload);
            clone.payload.username = 'something';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.taken);

            done();
        }).catch(function(e) {
            done(e);
        });
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