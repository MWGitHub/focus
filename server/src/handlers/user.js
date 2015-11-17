var User = require('../models/user');
var Auth = require('../auth/auth');
var Session = require('../auth/session');
var Boom = require('boom');
var Bcrypt = require('bcrypt');
var API = require('../lib/api');
var moment = require('moment-timezone');
var co = require('co');

var UserHandler = {};

UserHandler.StatusCodes = {
    NameTaken: 440
};

/**
 * Registers a user and populates with default data.
 * @param request
 * @param reply
 */
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
            return API.populateUser(user);
        })
        .then(function(user) {
            return user.retrieveAsData(false);
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
                    var token = Session.generateToken(user.get('id'));
                    Session.login(token).then(function() {
                        return user.retrieveAsData(false);
                    })
                    .then(function(data) {
                        data.token = token;
                        reply(API.makeData(data));
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
            reply(Boom.wrap(e));
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
    var isDeep = !!request.query['isDeep'];
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
            return user.retrieveAsData(isDeep);
        })
        .then(function (data) {
            reply(API.makeData(data));
        })
        .catch(function (err) {
            reply(Boom.notFound());
        });
};

/**
 * Ages the user.
 * @param request
 * @param reply
 */
UserHandler.age = function(request, reply) {
    var force = request.payload['force'];
    var user;
    User.forge({id: request.auth.credentials.id}).fetch({require: true})
        // Update the user if needed
        .then(function(u) {
            user = u;
            return API.updateUserTasks(user, force);
        })
        .then(function() {
            return user.retrieveAsData(false);
        })
        .then(function(data) {
            reply(API.makeData(data));
        })
        .catch(function(err) {
            reply(Boom.notFound());
        });
};

UserHandler.update = function(request, reply) {
    var password = request.payload['password'];
    var timezone = request.payload['timezone'];
    var email = request.payload['email'];
    var options = {};

    var user;
    User.forge({id: request.auth.credentials.id}).fetch({require: true})
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
            return user.retrieveAsData(false);
        })
        .then(function(data) {
            reply(API.makeData(data));
        })
        .catch(function (err) {
            reply(Boom.notFound());
        });
};

module.exports = UserHandler;