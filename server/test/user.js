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

    it('should not log in with invalid credentials', function(done) {
        co(function* () {
            var response = yield helper.login(helper.userSeeds[0].username, 'invalid');
            assert.equal(response.statusCode, 401);

            response = yield helper.login(helper.userSeeds[0].username, helper.userSeeds[0].password);
            assert.equal(response.statusCode, 200);

            done();
        }).catch(function(e) {
            done(e);
        })
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

            payload.headers = {
                authorization: token
            };
            response = yield helper.inject(payload);
            assert.equal(response.result.meta.message, 'Logged out');

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should retrieve the user', function(done) {
        co(function* () {
            // Retrieve as a guest
            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/users/0'
            };

            var response = yield helper.inject(payload);
            assert.equal(response.result.data.id, 0);
            assert.equal(response.result.data.attributes.username, 'seed0');
            assert.equal(response.result.data.attributes.email, null);

            // Retrieve when logged in as the owner
            var user = helper.userSeeds[0];
            response = yield helper.login(user.username, user.password);
            var token = response.result.data.token;

            payload.headers = {
                authorization: token
            };
            response = yield helper.inject(payload);
            assert.equal(response.result.data.id, 0);
            assert.equal(response.result.data.attributes.username, 'seed0');
            assert.equal(response.result.data.attributes.email, 'seed0@example.com');

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should update the user', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            // Change time zone
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/users/' + user.id + '/update',
                headers: {
                    authorization: token
                },
                payload: {}
            };

            var clone = _.cloneDeep(payload);
            clone.payload.timezone = moment.tz.names()[10];
            var response = yield helper.inject(clone);
            assert.equal(response.result.data.attributes.timezone, moment.tz.names()[10]);
            assert.equal(response.result.data.attributes.email, user.email);

            // Change the email
            clone = _.cloneDeep(payload);
            clone.payload.email = 'another@example.com';
            response = yield helper.inject(clone);
            assert.equal(response.result.data.attributes.timezone, moment.tz.names()[10]);
            assert.equal(response.result.data.attributes.email, 'another@example.com');

            // Change the password
            clone = _.cloneDeep(payload);
            clone.payload.password = 'another';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, 200);
            yield helper.inject({
                method: 'GET',
                url: helper.apiRoute + '/users/logout',
                headers: {
                    authorization: token
                }
            });
            response = yield helper.login(user.username, user.password);
            assert.equal(response.statusCode, 401);
            response = yield helper.login(user.username, 'another');
            assert.equal(response.statusCode, 200);

            // Change everything at the same time
            user = helper.userSeeds[1];
            token = (yield helper.login(user.username, user.password)).result.data.token;
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/users/' + user.id + '/update',
                headers: {
                    authorization: token
                },
                payload: {
                    timezone: moment.tz.names()[20],
                    password: 'something',
                    email: 'new@example.com'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.result.data.attributes.timezone, moment.tz.names()[20]);
            assert.equal(response.result.data.attributes.email, 'new@example.com');
            yield helper.inject({
                method: 'GET',
                url: helper.apiRoute + '/users/logout',
                herders: {
                    authorization: token
                }
            });
            response = yield helper.login(user.username, user.password);
            assert.equal(response.statusCode, 401);
            response = yield helper.login(user.username, 'something');
            assert.equal(response.statusCode, 200);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid update inputs', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/users/' + user.id + '/update',
                headers: {
                    authorization: token
                },
                payload: {}
            };

            // Invalid email
            var clone = _.cloneDeep(payload);
            clone.payload.email = 'invalid';
            var response = yield helper.inject(clone);
            assert.equal(response.statusCode, 400);

            // Invalid password
            clone = _.cloneDeep(payload);
            clone.payload.password = 'a';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, 400);

            // Valid email and invalid password
            clone = _.cloneDeep(payload);
            clone.payload.email = 'valid@example.com';
            clone.payload.password = 'a';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, 400);

            // Invalid email, valid password
            clone = _.cloneDeep(payload);
            clone.payload.email = 'invalid';
            clone.payload.password = 'aasdfbawerawer';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, 400);

            // Invalid timezone
            clone = _.cloneDeep(payload);
            clone.payload.timezone = 'invalid';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, 400);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not update the user without permissions', function(done) {
        co(function* () {
            var updatedUser = helper.userSeeds[0];
            var authUser = helper.userSeeds[1];
            var token = (yield helper.login(authUser.username, authUser.password)).result.data.token;
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/users/' + updatedUser.id + '/update',
                headers: {
                    authorization: token
                },
                payload: {}
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, 401);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should delete the user', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];

            // Confirm user can be retrieved
            var getPayload = {
                method: 'GET',
                url: helper.apiRoute + '/users/' + user.id
            };
            var response = yield helper.inject(getPayload);
            assert.equal(response.statusCode, 200);

            // Delete the user
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var payload = {
                method: 'DELETE',
                url: helper.apiRoute + '/users/' + user.id,
                headers: {
                    authorization: token
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, 200);

            // Confirm user is deleted
            response = yield helper.inject(getPayload);
            assert.equal(response.statusCode, 404);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not delete the user without permissions', function(done) {
        co(function* () {
            var deletedUser = helper.userSeeds[0];
            var authUser = helper.userSeeds[1];
            var token = (yield helper.login(authUser.username, authUser.password)).result.data.token;
            var payload = {
                method: 'DELETE',
                url: helper.apiRoute + '/users/' + deletedUser.id,
                headers: {
                    authorization: token
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, 401);

            done();
        }).catch(function(e) {
            done(e);
        });
    });
});