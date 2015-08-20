var User = require('../models/user');
var Auth = require('../lib/auth');
var Boom = require('boom');
var Bcrypt = require('bcrypt');
var API = require('../lib/api');

var userHandler = {
    /**
     * Registers a user and populates with default data.
     * @param request
     * @param reply
     */
    register: function(request, reply) {
        "use strict";

        var username = request.payload['username'].toLowerCase();
        var password = request.payload['password'];

        // Check to make sure the username does not already exist
        User.forge({username: username}).fetch()
            .then(function(user) {
                if (!user) {
                    Auth.hash(password, function(err, hash) {
                        if (err) {
                            reply(Boom.badImplementation());
                        } else {
                            User.forge({
                                username: username,
                                password: hash
                            }).save().then(function() {
                                API.populateUser(username);
                            }).then(function() {
                                reply(API.makeStatusMessage('user-register', true, 'User created'));
                            });
                        }
                    });
                } else {
                    reply(Boom.unauthorized('Username already taken'));
                }
            });
    },

    /**
     * Log in as a user.
     * @param request
     * @param reply
     */
    login: function(request, reply) {
        "use strict";

        var username = request.payload['username'].toLowerCase();
        var password = request.payload['password'];

        // Check to make sure the username exists
        User.forge({username: username}).fetch()
            .then(function(user) {
                if (!user) {
                    reply(Boom.unauthorized());
                } else {
                    Bcrypt.compare(password, user.get('password'), function(err, isValid) {
                        if (err) {
                            reply(Boom.badImplementation());
                        } else if (isValid) {
                            //reply(user.get('username') + ' has been found.');
                            reply(API.makeStatusMessage('user-login', true, Auth.generateToken(user.get('id'))));
                        } else {
                            reply(Boom.unauthorized());
                        }
                    });
                }
            });
    },

    /**
     * Logs out the user.
     * @param request
     * @param reply
     */
    logout: function(request, reply) {
        "use strict";

        if (request.auth.isAuthenticated) {
            reply(API.makeStatusMessage('user-logout', true, 'Logged out')).code(401);
        } else {
            reply(API.makeStatusMessage('user-logout', true, 'Not logged in'));
        }
    },

    /**
     * Delete the user.
     * @param request
     * @param reply
     */
    deleteSelf: function(request, reply) {
        "use strict";

        User.forge({id: request.auth.credentials.id}).fetch()
            .then(function(user) {
                if (!user) {
                    reply(Boom.notFound());
                } else {
                    user.destroy().then(function() {
                        reply(API.makeStatusMessage('user-delete', true, 'User deleted')).redirect(API.route + '/user/logout');
                    });
                }
            });
    },

    /**
     * Retrieve info about the use.
     * @param request
     * @param reply
     */
    retrieve: function(request, reply) {
        "use strict";

        User.forge({id: request.auth.credentials.id}).fetch()
            .then(function(user) {
                if (!user) {
                    reply(Boom.notFound());
                } else {
                    API.makeData(user.retrieveAsData().then(function(data) {
                        reply(data);
                    }));
                }
            });
    }
};

module.exports = userHandler;