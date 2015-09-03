var assert = require('chai').assert;
var Lab = require('lab');
var User = require('../src/models/user');
var Auth = require('../src/lib/auth');
var moment = require('moment-timezone');
var API = require('../src/lib/api');
var helper = require('./helper');

var lab = exports.lab = Lab.script();
var server = require('../index');

/**
 * Generate the authorization header string.
 * @param {String} username the username to use.
 * @param {String} password the password of the user.
 * @returns {string} the generated header.
 */
function generateAuthHeader(username, password) {
    "use strict";

    return 'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64');
}

lab.experiment('test registration', function() {
    "use strict";

    lab.before(function(done) {
        console.log('\nBefore: Removing any previous test users');
        // Remove all test users if exists
        helper.removeAllTestUsers().then(function() {
            done();
        });
    });

    lab.after(function(done) {
        console.log('\nAfter: Removing all test users');

        helper.removeAllTestUsers().then(function() {
            done();
        });
    });

    lab.test('registers a user', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[0],
                password: 'testpw0'
            }
        }, function(response) {
            assert.equal(response.statusCode, 200);
            assert.equal(response.result.data.username, helper.testUsers[0]);
            done();
        });
    });

    lab.test('registers a user with invalid time zone', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[1],
                password: 'testpw0',
                timezone: 'nope'
            }
        }, function(response) {
            assert.equal(response.statusCode, 400);
            done();
        });
    });

    lab.test('registers a user with a time zone', function(done) {

        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[1],
                password: 'testpw0',
                timezone: moment.tz.names()[0]
            }
        }, function(response) {
            assert.equal(response.statusCode, 200);
            assert.equal(response.result.data.timezone, moment.tz.names()[0]);
            done();
        });
    });

    lab.test('returns an error when registering the same user', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[0],
                password: helper.password
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    lab.test('returns an error when missing password', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[1]
            }
        }, function (response) {
            assert.equal(response.statusCode, 400, 'Error when missing the password');
            done();
        });
    });

    lab.test('returns an error when missing the username', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                password: helper.password
            }
        }, function(response) {
            assert.equal(response.statusCode, 400, 'Error when missing the username');
            done();
        });
    });

    lab.test('returns an error when username is too short', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: 'gu',
                password: helper.password
            }
        }, function(response) {
            assert.equal(response.statusCode, 400, 'Error when username is too short');
            done();
        });
    });

    lab.test('returns an error when username is too long', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: '123456789012345678901',
                password: helper.password
            }
        }, function(response) {
            assert.equal(response.statusCode, 400, 'Error when username is too long');
            done();
        });
    });

    lab.test('returns an error when password is too short', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[1],
                password: 'test'
            }
        }, function(response) {
            assert.equal(response.statusCode, 400, 'Error when password is too short');
            done();
        });
    });
});

lab.experiment('test authentication', function() {
    "use strict";
    var jwt = null;
    var userInstances;

    lab.before(function(done) {
        console.log('\nBefore: Removing any previous test users and creating new test users');
        // Remove all test users if exists
        helper.removeAllTestUsers().then(function() {
            return helper.createAllTestUsers();
        }).then(function(users) {
            userInstances = users;
            done();
        });
    });

    lab.after(function(done) {
        console.log('\nAfter: Removing all test users');

        helper.removeAllTestUsers().then(function() {
            done();
        });
    });

    lab.test('fails log in', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users/login',
            payload: {
                username: helper.testUsers[0],
                password: 'wrong54'
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    lab.test('logged in', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users/login',
            payload: {
                username: userInstances[0].get('username'),
                password: helper.password
            }
        }, function(response) {
            jwt = response.result.meta.message;
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    lab.test('access authorized page without being logged in', function(done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id')
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    lab.test('access authorized page while logged in', function(done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id'),
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt
            }
        }, function(response) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    lab.test('logout when logged in', function(done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/logout',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt
            }
        }, function(response) {
            assert.equal(response.statusCode, 200);
            done();
        });
    });

    lab.test('logout when not logged in', function(done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/logout'
        }, function(response) {
            assert.equal(response.result.meta.message, 'Not logged in');
            done();
        });
    });

    lab.test('delete user without permission should fail', function(done) {
        server.inject({
            method: 'DELETE',
            url: helper.apiRoute + '/users/' + userInstances[1].get('id'),
            headers: {
                authorization: jwt
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    lab.test('delete self', function(done) {
        server.inject({
            method: 'DELETE',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id'),
            headers: {
                authorization: jwt
            }
        }, function(response) {
            User.forge({username: userInstances[0]}).fetch().then(function(user) {
                assert.notOk(user);
                done();
            });
        });
    });
});