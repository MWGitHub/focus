/**
 * Authentication plugin to support multiple authentication systems.
 * Session validation can be added which supports invalidating tokens, otherwise any token that can be decoded
 * with the key will be used.
 *
 */
"use strict";

var Bcrypt = require('bcrypt');
var AuthJWT = require('hapi-auth-jwt2');
var co = require('co');
var assert = require('assert');
var Logger = require('../lib/logger');

var internals = {
    session: {
        validate: null,
        key: null
    },

    permission: {
        scope: null
    }
};

internals.validateJWT = function(decoded, request, callback) {
    co(function* () {
        // No validation function, allow any decoded token token as valid
        if (!internals.session.validate) {
            return callback(null, true);
        }

        // Check if token is still valid
        var valid = yield internals.session.validate(decoded[internals.session.key]);
        if (!valid) {
            return callback(null, false);
        }

        // Check if the scope if required
        if (request.route.settings.auth.access) {
            var scope = [];
            if (internals.permission.scope) {
                scope = yield internals.permission.scope(decoded.id, request);
            }
            //console.log('scope');
            //console.log(scope);
            var credentials = {
                id: decoded.id,
                scope: scope
            };
            credentials[internals.session.key] = decoded[internals.session.key];
            //console.log(credentials);
            callback(null, valid, credentials);
        } else {
            return callback(null, valid);
        }
    }, function(err) {
        Logger.error(err);
        return callback(e, false);
    });
};

internals.setSessionOptions = function(validateFunction, key) {
    internals.session.validate = validateFunction;
    internals.session.key = key;
};

internals.setPermissionOptions = function(scopeFunction) {
    internals.permission.scope = scopeFunction;
};

var auth = {
    register: function(server, options, next) {
        assert(options, 'options are required');
        assert(options.key, 'key is required');

        // Register the JWT plugin
        server.register(AuthJWT, function(err) {
            server.auth.strategy('jwt', 'jwt', {
                validateFunc: internals.validateJWT,
                key: options.key,
                verifyOptions: {
                    algorithms: ['HS256']
                },
                urlKey: true
            });
        });

        server.expose('setSessionOptions', internals.setSessionOptions);
        server.expose('setPermissionOptions', internals.setPermissionOptions);

        next();
    },

    /**
     * Hashes the passed in data.
     * @param data the data to hash.
     * @returns {Promise} the promise
     */
    hash: function(data) {
        "use strict";

        return new Promise(function(resolve, reject) {
            Bcrypt.genSalt(10, function(err, salt) {
                if (err) {
                    reject(err);
                } else {
                    Bcrypt.hash(data, salt, function (err, hash) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(hash);
                        }
                    });
                }
            });
        });
    }
};

auth.register.attributes = {
    name: 'auth',
    version: '0.0.1'
};

module.exports = auth;