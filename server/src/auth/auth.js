var Bcrypt = require('bcrypt');
var AuthBasic = require('hapi-auth-basic');
var AuthJWT = require('hapi-auth-jwt2');
var User = require('../models/user');
var Config = require('../../config.json');
var Session = require('./session');

function validateBasic(request, username, password, callback) {
    "use strict";

    User.forge({username: username}).fetch()
        .then(function(user) {
            if (!user) {
                return callback(null, false);
            } else {
                Bcrypt.compare(password, user.get('password'), function(err, isValid) {
                    callback(err, isValid, {id: user.get('id'), username: user.get('username')});
                });
            }
        });
}

function validateJWT(decoded, request, callback) {
    "use strict";

    Session.validate(decoded.tid).then(function() {
        callback(null, true);
    })
    .catch(function(e) {
        callback(e, false);
    });
}

var auth = {
    register: function(server, options, next) {
        "use strict";
        // Add the basic authentication
        server.register(AuthBasic, function(err) {
            server.auth.strategy('simple', 'basic', {
                validateFunc: validateBasic
            });
        });

        server.register(AuthJWT, function(err) {
            server.auth.strategy('jwt', 'jwt', {
                validateFunc: validateJWT,
                key: Config.authkey,
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