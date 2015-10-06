var assert = require('chai').assert;
var Lab = require('lab');
var User = require('../src/models/user');
var UserHandler = require('../src/handlers/user');
var Auth = require('../src/auth/auth');
var Session = require('../src/auth/session');
var moment = require('moment-timezone');
var API = require('../src/lib/api');
var helper = require('./helper');
var should = require('chai').should();

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
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

describe('registration', function() {
    "use strict";

    before(function(done) {
        console.log('\nBefore: Removing any previous test users');
        // Remove all test users if exists
        helper.removeAllTestUsers().then(function() {
            done();
        });
    });

    after(function(done) {
        console.log('\nAfter: Removing all test users');

        helper.removeAllTestUsers().then(function() {
            done();
        });
    });

    it('should register a user when POSTing to api/users', function(done) {
        helper.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[0],
                password: 'testpw0'
            }
        }).then(function(response) {
            response.statusCode.should.equal(200);
            response.result.data.attributes.username.should.equal(helper.testUsers[0]);
            done();
        });
    });

    it('should return error status when given an invalid time zone', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[1],
                password: 'testpw0',
                timezone: 'nope'
            }
        }, function(response) {
            response.statusCode.should.equal(400);
            done();
        });
    });

    it('should register with a time zone and set it', function(done) {

        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[1],
                password: 'testpw0',
                timezone: moment.tz.names()[0]
            }
        }, function(response) {
            response.statusCode.should.equal(200);
            response.result.data.attributes.timezone.should.equal(moment.tz.names()[0]);
            done();
        });
    });

    it('should return an error status when registering an existing user', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[0],
                password: helper.password
            }
        }, function(response) {
            response.statusCode.should.equal(UserHandler.StatusCodes.NameTaken);
            done();
        });
    });

    it('should return an error when missing password', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[1]
            }
        }, function (response) {
            response.statusCode.should.equal(400);
            done();
        });
    });

    it('should return an error when missing the username', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                password: helper.password
            }
        }, function(response) {
            response.statusCode.should.equal(400);
            done();
        });
    });

    it('should return an error when username is too short', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: 'gu',
                password: helper.password
            }
        }, function(response) {
            response.statusCode.should.equal(400);
            done();
        });
    });

    it('should return an error when username is too long', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: '123456789012345678901',
                password: helper.password
            }
        }, function(response) {
            response.statusCode.should.equal(400);
            done();
        });
    });

    it('should return an error when password is too short', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users',
            payload: {
                username: helper.testUsers[1],
                password: 'test'
            }
        }, function(response) {
            response.statusCode.should.equal(400);
            done();
        });
    });
});

describe('authentication', function() {
    "use strict";
    var jwt = null;
    var userInstances;

    before(function (done) {
        console.log('\nBefore: Removing any previous test users and creating new test users');
        // Remove all test users if exists
        helper.removeAllTestUsers().then(function () {
            return helper.createAllTestUsers();
        }).then(function (users) {
            userInstances = users;
            done();
        });
    });

    after(function (done) {
        console.log('\nAfter: Removing all test users');

        helper.removeAllTestUsers().then(function () {
            done();
        });
    });

    it('should fail log in with wrong password', function (done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users/login',
            payload: {
                username: helper.testUsers[0],
                password: 'wrong54'
            }
        }, function (response) {
            response.statusCode.should.equal(401);
            done();
        });
    });

    it('should log in when correct', function (done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users/login',
            payload: {
                username: userInstances[0].get('username'),
                password: helper.password
            }
        }, function (response) {
            jwt = response.result.data.token;
            response.result.data.id.should.equal(userInstances[0].get('id'));
            response.statusCode.should.equal(200);
            done();
        });
    });

    it('should be unauthorized when accessing authorized page without being logged in', function (done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id')
        }, function (response) {
            response.statusCode.should.equal(401);
            done();
        });
    });

    it('should retrieve authorized page while logged in', function (done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id'),
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt
            }
        }, function (response) {
            response.statusCode.should.equal(200);
            response.result.data.attributes.username.should.equal(userInstances[0].get('username'));
            done();
        });
    });

    it('should log out when logged in', function (done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/logout',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt
            }
        }, function (response) {
            response.statusCode.should.equal(200);
            done();
        });
    });

    it('should return not logged in when logging out without authentication', function (done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/logout'
        }, function (response) {
            response.result.meta.message.should.equal('Not logged in');
            done();
        });
    });

    it('should fail when accessing authorized page while using revoked credentials', function (done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id'),
            headers: {
                authorization: jwt
            }
        }, function (response) {
            response.statusCode.should.equal(401);
            done();
        });
    });

    it('should fail when accessing authorized page with expired token', function (done) {
        var token = Session.generateToken(userInstances[0].get('id'));
        Session.login(token, 1).then(function () {
            setTimeout(function () {
                server.inject({
                    method: 'GET',
                    url: helper.apiRoute + '/users/' + userInstances[0].get('id'),
                    headers: {
                        authorization: token
                    }
                }, function (response) {
                    response.statusCode.should.equal(401);
                    done();
                });
            }, 1100);
        });
    });
});

describe('user modification', function() {
    "use strict";
    var jwt = null;
    var userInstances;

    before(function (done) {
        console.log('\nBefore: Removing any previous test users and creating new test users');
        // Remove all test users if exists
        helper.removeAllTestUsers().then(function () {
            return helper.createAllTestUsers();
        }).then(function (users) {
            userInstances = users;
            done();
        });
    });

    after(function (done) {
        console.log('\nAfter: Removing all test users');

        helper.removeAllTestUsers().then(function () {
            done();
        });
    });

    it('should log in', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users/login',
            payload: {
                username: userInstances[0].get('username'),
                password: helper.password
            }
        }, function(response) {
            jwt = response.result.data.token;
            response.result.data.id.should.equal(userInstances[0].get('id'));
            response.statusCode.should.equal(200);
            done();
        });
    });

    it('should fail when deleting user without correct authorization', function(done) {
        server.inject({
            method: 'DELETE',
            url: helper.apiRoute + '/users/' + userInstances[1].get('id'),
            headers: {
                authorization: jwt
            }
        }, function(response) {
            response.statusCode.should.equal(401);
            done();
        });
    });

    it('should change password', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id') + '/update',
            headers: {
                authorization: jwt
            },
            payload: {
                password: 'newpass'
            }
        }, function(response) {
            server.inject({
                method: 'POST',
                url: helper.apiRoute + '/users/login',
                payload: {
                    username: userInstances[0].get('username'),
                    password: 'newpass'
                }
            }, function(response) {
                jwt = response.result.data.token;
                response.result.data.id.should.equal(userInstances[0].get('id'));
                response.statusCode.should.equal(200);
                done();
            });
        })
    });

    it('should change timezone', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id') + '/update',
            headers: {
                authorization: jwt
            },
            payload: {
                timezone: moment.tz.names()[0]
            }
        }, function(response) {
            response.result.data.attributes.timezone.should.equal(moment.tz.names()[0]);
            User.forge({id: userInstances[0].get('id')}).fetch().then(function(user) {
                user.get('timezone').should.equal(moment.tz.names()[0]);
                done();
            });
        });
    });

    it('should fail when changing password with correct authorization', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id') + '/update',
            headers: {
                authorization: 'none'
            },
            payload: {
                password: 'newpass'
            }
        }, function(response) {
            response.statusCode.should.equal(401);
            done();
        })
    });

    it('should delete itself', function(done) {
        server.inject({
            method: 'DELETE',
            url: helper.apiRoute + '/users/' + userInstances[0].get('id'),
            headers: {
                authorization: jwt
            }
        }, function(response) {
            response.statusCode.should.equal(200);
            User.forge({username: userInstances[0]}).fetch().then(function(user) {
                should.not.exist(user);
                done();
            });
        });
    });
});