var User = require('../models/user');
var Auth = require('../lib/auth');
var Boom = require('boom');
var Bcrypt = require('bcrypt');
var API = require('../lib/api');
var moment = require('moment-timezone');

var UserHandler = {};

UserHandler.StatusCodes = {
    NameTaken: 440
};

UserHandler.register = function(request, reply) {
    "use strict";

    var username = request.payload['username'].toLowerCase();
    var password = request.payload['password'];
    var timezone = request.payload['timezone'] || API.defaultTimeZone;

    // Check to make sure the username does not already exist
    User.forge({username: username}).fetch()
        .then(function(user) {
            if (user) throw new Error();
        })
        .catch(function(e) {
            throw(Boom.wrap(e, UserHandler.StatusCodes.NameTaken, "Username already taken"));
        })
        .then(function() {
            return Auth.hash(password);
        })
        .then(function(hash) {
            return User.forge({
                username: username,
                password: hash,
                timezone: timezone
            }).save()
        })
        .then(function(user) {
            return API.populateUser(user).then(function() {
                reply(API.makeData({
                    id: user.get('id'),
                    username: user.get('username'),
                    timezone: user.get('timezone')
                }));
            });
        })
        .catch(function(e) {
            reply(Boom.wrap(e, 400));
        });
};

/**
 * Registers a user and populates with default data.
 * @param request
 * @param reply
 */


/**
 * Log in as a user.
 * @param request
 * @param reply
 */
UserHandler.login = function(request, reply) {
    "use strict";

    var username = request.payload['username'].toLowerCase();
    var password = request.payload['password'];

    // Check to make sure the username exists
    User.forge({username: username}).fetch({require: true})
        .then(function (user) {
            Bcrypt.compare(password, user.get('password'), function (err, isValid) {
                if (err) {
                    reply(Boom.badImplementation());
                } else if (isValid) {
                    var token = Auth.generateToken(user.get('id'));
                    Auth.login(token).then(function () {
                        reply(API.makeData({
                            id: user.get('id'),
                            token: token
                        }));
                    })
                        .catch(function (err) {
                            reply(Boom.unauthorized());
                        });
                } else {
                    reply(Boom.unauthorized());
                }
            });
        })
        .catch(function (e) {
            reply(Boom.unauthorized());
        });
};

/**
 * Logs out the user.
 * @param request
 * @param reply
 */
UserHandler.logout = function(request, reply) {
    "use strict";

    if (request.auth.isAuthenticated) {
        if (request.auth.strategy === 'simple') {
            reply(API.makeStatusMessage('user-logout', true, 'Logged out')).code(401);
        } else {
            Auth.logout(request.auth.credentials.tid)
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
 * Removes the given user.
 * @param request
 * @param reply
 */
UserHandler.remove = function(request, reply) {
    "use strict";

    var id = request.params.id;
    // Cannot delete when not owner
    // TODO: Support admin deletion
    if (request.auth.credentials.id !== id) {
        reply(Boom.unauthorized());
        return;
    }
    User.forge({id: id}).fetch({require: true})
        .then(function (user) {
            return user.destroyDeep();
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

/**
 * Retrieve info about the use.
 * @param request
 * @param reply
 */
UserHandler.retrieve = function(request, reply) {
    "use strict";

    var id = request.params.id;
    // Do not allow non owning user to retrieve user data
    // TODO: Add partial retrieval of user page when not owner
    if (!request.auth.isAuthenticated || id !== request.auth.credentials.id) {
        reply(Boom.unauthorized());
        return;
    }

    var user;
    User.forge({id: id}).fetch({require: true})
        // Update the user if needed
        .then(function (v) {
            user = v;
            return API.updateUserTasks(user);
        })
        // Retrieve the user data
        .then(function () {
            return user.retrieveAsData();
        })
        .then(function (data) {
            reply(API.makeData(data));
        })
        .catch(function (err) {
            reply(Boom.notFound());
        });
};

/**
 * Updates the user.
 * @param request
 * @param reply
 */
UserHandler.update = function(request, reply) {
    var force = request.payload['force'];
    User.forge({id: request.auth.credentials.id}).fetch({require: true})
        // Update the user if needed
        .then(function (user) {
            return API.updateUserTasks(user, force);
        })
        .then(function () {
            reply(API.makeStatusMessage('user-update', true, 'User updated'));
        })
        .catch(function (err) {
            reply(Boom.notFound());
        });
};

module.exports = UserHandler;