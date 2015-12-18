"use strict";

var Bcrypt = require('bcrypt');
var AuthJWT = require('hapi-auth-jwt2');
var Session = require('./../session/session');
var co = require('co');

function validateJWT(scopeFunction) {
    return function(decoded, request, callback) {
        co(function* () {
            var valid = yield Session.validate(decoded.tid);
            if (!valid) {
                return callback(null, false);
            }

            if (request.route.settings.auth.scope) {
                var scope = [];
                if (scopeFunction) {
                    scope = yield scopeFunction(decoded.id, request);
                }
                // console.log('scope');
                // console.log(scope);
                var credentials = {
                    id: decoded.id,
                    tid: decoded.tid,
                    scope: scope
                };
                // console.log(credentials);
                callback(null, valid, credentials);
            } else {
                return callback(null, valid);
            }
        }, function(err) {
            return callback(e, false);
        });
    };
}

var auth = {
    register: function(server, options, next) {
        "use strict";

        if (!options.key) throw new Error('options.key required!');

        // Add permission checking if given.
        var scopeFunction = null;
        if (options.permission) {
            var permissionPlugin = server.plugins[options.permission.plugin];
            if (!permissionPlugin) {
                throw new Error('Cannot find permission plugin');
            }
            scopeFunction = permissionPlugin[options.permission.scope];
            if (!scopeFunction) {
                throw new Error('Cannot find permission scope');
            }
        }

        server.register(AuthJWT, function(err) {
            server.auth.strategy('jwt', 'jwt', {
                validateFunc: validateJWT(scopeFunction),
                key: options.key,
                verifyOptions: {
                    algorithms: ['HS256']
                },
                urlKey: true
            });
        });

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