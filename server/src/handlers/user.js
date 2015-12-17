"use strict";

var User = require('../models/user');
var Auth = require('../auth/auth');
var Session = require('../auth/session');
var Boom = require('boom');
var Bcrypt = require('bcrypt');
var API = require('../lib/api');
var moment = require('moment-timezone');
var co = require('co');

var UserHandler = {};

/**
 * Status codes for responses.
 * @type {{NameTaken: number}}
 */
UserHandler.StatusCodes = {
    NameTaken: 440
};

/**
 * Registers a user and populates with default data.
 * @param request
 * @param reply
 */
UserHandler.register = function(request, reply) {
    var username = request.payload['username'];
    var password = request.payload['password'];
    var timezone = request.payload['timezone'] || API.defaultTimeZone;
    var email = request.payload['email'];
    if (email) {
        email = email.toLowerCase();
    }

    // Check to make sure the username or verified email does not already exist
    User.findUser(username, email)
        .then(function(user) {
            if (user) {
                throw(Boom.wrap(new Error(), UserHandler.StatusCodes.NameTaken, "Username or email already taken"));
            }
        })
        .then(function() {
            return Auth.hash(password);
        })
        .then(function(hash) {
            var data = {
                username: username,
                password: hash,
                timezone: timezone
            };
            if (email) {
                data.email = email;
            }

            return User.forge(data).save()
        })
        .then(function(user) {
            return user.retrieve(User.retrievals.owner);
        })
        .then(function(data) {
            reply(API.makeData(data));
        })
        .catch(function(e) {
            reply(Boom.wrap(e, 400));
        });
};

/**
 * Log in as a user.
 * @param request
 * @param reply
 */
UserHandler.login = function(request, reply) {
    var login = request.payload['login'].toLowerCase();
    var password = request.payload['password'];

    // Check to make sure the username exists
    User.findUser(login, login)
        .then(function (user) {
            if (!user) {
                throw Boom.unauthorized();
            }
            Bcrypt.compare(password, user.get('password'), function (err, isValid) {
                if (err) {
                    reply(Boom.badImplementation());
                } else if (isValid) {
                    var token = Session.generateToken(user.get('id'));
                    Session.login(token).then(function() {
                        return user.retrieve(User.retrievals.owner);
                    })
                    .then(function(data) {
                        data.token = token;
                        reply(API.makeData(data));
                    })
                    .catch(function (err) {
                        console.log(err);
                        reply(Boom.unauthorized());
                    });
                } else {
                    reply(Boom.unauthorized());
                }
            });
        })
        .catch(function (e) {
            reply(Boom.wrap(e));
        });
};

/**
 * Logs out the user.
 * @param request
 * @param reply
 */
UserHandler.logout = function(request, reply) {
    if (request.auth.isAuthenticated) {
        if (request.auth.strategy === 'simple') {
            reply(API.makeStatusMessage('user-logout', true, 'Logged out')).code(401);
        } else {
            Session.logout(request.auth.credentials.tid)
                .then(function () {
                    reply(API.makeStatusMessage('user-logout', true, 'Logged out'));
                })
                .catch(function (err) {
                    reply(Boom.badRequest());
                });
        }
    } else {
        reply(API.makeStatusMessage('user-logout', true, 'Not logged in'));
    }
};

/**
 * Retrieve info about the use.
 * @param request
 * @param reply
 */
UserHandler.retrieve = function(request, reply) {
    var id = request.params.id;
    var isUser = request.auth.isAuthenticated && request.auth.credentials.id === id;

    co(function* () {
        var user = yield User.forge({id: id}).fetch({require: true});
        var data = yield isUser ? user.retrieve(User.retrievals.owner) : user.retrieve(User.retrievals.guest);
        reply(API.makeData(data));
    }).catch(function(err) {
        reply(Boom.notFound());
    });
};

UserHandler.update = function(request, reply) {
    var id = request.params.id;
    var password = request.payload['password'];
    var timezone = request.payload['timezone'];
    var email = request.payload['email'];
    var options = {};

    if (parseInt(id) !== request.auth.credentials.id) {
        reply(Boom.unauthorized());
        return;
    }

    var user;
    User.forge({id: id}).fetch({require: true})
        .then(function(result) {
            user = result;
            // Check if parameters changed
            if (timezone && user.get('timezone') !== timezone) {
                options.timezone = timezone;
            }
            if (email && user.get('email') !== email) {
                options.email = email;
                options.verified = false;
            }

            // Hash the password if changed
            if (password) {
                return Auth.hash(password);
            } else {
                return(null);
            }
        })
        .then(function(hash) {
            if (hash) {
                options.password = hash;
            }
        })
        .then(function() {
            return user.set(options).save();
        })
        .then(function() {
            return user.retrieve(User.retrievals.owner);
        })
        .then(function(data) {
            reply(API.makeData(data));
        })
        .catch(function (err) {
            reply(Boom.notFound());
        });
};

/**
 * Removes the given user.
 * @param request
 * @param reply
 */
UserHandler.remove = function(request, reply) {
    var id = request.params.id;
    // Cannot delete when not owner
    if (request.auth.credentials.id !== id) {
        reply(Boom.unauthorized());
        return;
    }
    User.forge({id: id}).fetch({require: true})
        .then(function (user) {
            return user.destroy();
        })
        .then(function () {
            if (request.auth.strategy === 'simple') {
                reply(API.makeStatusMessage('user-delete', true, 'User deleted')).redirect(API.route + '/user/logout');
            } else {
                reply(API.makeStatusMessage('user-delete', true, 'User deleted'));
            }
        })
        .catch(function (e) {
            reply(Boom.notFound());
        });
};

module.exports = UserHandler;