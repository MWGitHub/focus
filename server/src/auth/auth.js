"use strict";

var Bcrypt = require('bcrypt');
var AuthJWT = require('hapi-auth-jwt2');
var co = require('co');

var internals = {
    session: {
        validate: null,
        key: null
    },

    permission: {
        scope: null
    }
};

function validateJWT(decoded, request, callback) {
    co(function* () {
        var valid = yield internals.session.validate(decoded[internals.session.key]);
        if (!valid) {
            return callback(null, false);
        }

        if (request.route.settings.auth.scope) {
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
            // console.log(credentials);
            callback(null, valid, credentials);
        } else {
            return callback(null, valid);
        }
    }, function(err) {
        console.log(err);
        return callback(e, false);
    });
}

var auth = {
    register: function(server, options, next) {
        "use strict";

        if (!options.key) throw new Error('options.key required!');

        // Make sure sessions are supported
        if (!options.session) throw new Error('Session is required');
        if (!options.session.validate) throw new Error('Session validate function required');
        internals.session.validate = options.session.validate;
        if (!options.session.key) throw new Error('Session key required');
        internals.session.key = options.session.key;

        // Add permission checking if given
        if (options.permission) {
            internals.permission.scope = options.permission.scope;
        }

        server.register(AuthJWT, function(err) {
            server.auth.strategy('jwt', 'jwt', {
                validateFunc: validateJWT,
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