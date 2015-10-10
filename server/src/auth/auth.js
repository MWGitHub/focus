var Bcrypt = require('bcrypt');
var AuthBasic = require('hapi-auth-basic');
var AuthJWT = require('hapi-auth-jwt2');
var User = require('../models/user');
var Session = require('./session');
var co = require('co');

function getScope(uid, request) {
    console.log(request.config);
    return Promise.resolve(['admin', 'member', 'viewer']);
}

function validateBasic(request, username, password, callback) {
    "use strict";

    User.forge({username: username}).fetch()
        .then(function(user) {
            if (!user) {
                callback(null, false);
            } else {
                Bcrypt.compare(password, user.get('password'), function(err, isValid) {
                    callback(err, isValid, {id: user.get('id'), username: user.get('username')});
                });
            }
        });
}

function validateJWT(decoded, request, callback) {
    "use strict";

    co(function* () {
        var valid = yield Session.validate(decoded.tid);
        if (!valid) {
            return callback(null, false);
        }

        if (request.route.settings.auth.scope) {
            var scope = yield getScope(decoded.uid, request);
            console.log(scope);
            var credentials = {
                id: decoded.id,
                tid: decoded.tid,
                scope: scope
            };
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

        // Add the basic authentication
        server.register(AuthBasic, function(err) {
            server.auth.strategy('simple', 'basic', {
                validateFunc: validateBasic
            });
        });

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