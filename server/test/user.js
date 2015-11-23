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
                    username: testUser.username.toUpperCase(),
                    password: testUser.password,
                    email: testUser.email.toUpperCase(),
                    timezone: testUser.timezone
                }
            };

            // Make sure email is changed to lower case
            var response = yield helper.inject(payload);
            var attributes = response.result.data.attributes;
            assert.equal(response.statusCode, statusCodes.valid);
            assert.notEqual(attributes.username, testUser.username);
            assert.equal(attributes.username, testUser.username.toUpperCase());
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

            // Do not allow names of different cases
            var clone = _.cloneDeep(payload);
            clone.payload.username = testUser.username.toUpperCase();
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, statusCodes.taken);

            // Check if email is a duplicate
            clone = _.cloneDeep(payload);
            clone.payload.username = 'something';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, statusCodes.taken);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should log in and hash the user\'s password', function(done) {
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

            // Check that the given password is no longer the same
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, statusCodes.valid);
            var data = response.result.data.attributes;
            assert.notEqual(data.password, payload.payload.password);

            // Check logging in with username or email
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/users/login',
                payload: {
                    login: testUser.username,
                    password: testUser.password
                }
            };

            response = yield helper.inject(payload);
            assert.equal(response.statusCode, statusCodes.valid);
            assert.equal(response.result.data.attributes.username, testUser.username);

            payload.payload.login = testUser.email;
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, statusCodes.valid);
            assert.equal(response.result.data.attributes.username, testUser.username);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should log the user out', function(done) {
        co(function* () {
            // Create user
            var createPayload = {
                method: 'POST',
                url: helper.apiRoute + '/users',
                payload: {
                    username: testUser.username,
                    password: testUser.password,
                    email: testUser.email,
                    timezone: testUser.timezone
                }
            };
            yield helper.inject(createPayload);

            // Log out without logging in
            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/users/logout'
            };

            var response = yield helper.inject(payload);
            assert.equal(response.result.meta.action, 'user-logout');
            assert.equal(response.result.meta.message, 'Not logged in');

            // Log out while logged in
            var loginPayload = {
                method: 'POST',
                url: helper.apiRoute + '/users/login',
                payload: {
                    login: testUser.username,
                    password: testUser.password
                }
            };

            response = yield helper.inject(loginPayload);
            var token = response.result.data.token;

            response = yield helper.inject(payload);
            payload.headers = {
                authorization: token
            };
            console.log(payload);
            assert.equal(response.result.meta.message, 'Logged out');

            done();
        }).catch(function(e) {
            done(e);
        });
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