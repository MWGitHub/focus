var Bcrypt = require('bcrypt');
var AuthBasic = require('hapi-auth-basic');
var AuthJWT = require('hapi-auth-jwt2');
var JWT = require('jsonwebtoken');
var User = require('../models/user');
var Config = require('../../config.json');
var RedisClient = require('./redis-client');
var uuid = require('node-uuid');

var tokenTable = 'token:';
// Token expires in 30 days
var expiration = 60 * 60 * 24 * 30;

/**
 * Sign data with JWT.
 * @param {*} data the data to sign.
 * @returns {String} the signed data.
 */
function sign(data) {
    return JWT.sign(data, Config.authkey);
}

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

    RedisClient.client.get(tokenTable + decoded.tid, function(err, reply) {
        if (err) console.log(err);
        if (reply) {
            return callback(err, true);
        } else {
            return callback(err, false);
        }
    });
    /*
    User.forge({id: uid}).fetch()
        .then(function(user) {
            if (!user) {
                return callback(null, false);
            } else {
                callback(null, true);
            }
        });
     */
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
    },

    /**
     * Decodes a token.
     * @param {String} token the token to decode.
     * @returns {{info, data}} the token info and data.
     */
    decodeToken: function(token) {
        var segments = token.split('.');
        return {
            info: JSON.parse(new Buffer(segments[0], 'base64').toString()),
            data: JSON.parse(new Buffer(segments[1], 'base64').toString())
        };
    },

    login: function(token, duration) {
        var ttl = duration || expiration;
        var parsed = this.decodeToken(token);
        return new Promise(function(resolve, reject) {
            RedisClient.client.set(tokenTable + parsed.data.tid, parsed.data.id, function(err, res) {
                RedisClient.client.expire(tokenTable + parsed.data.tid, ttl);
                err ? reject(err) : resolve(res);
            });
        });
    },

    logout: function(tid) {
        return new Promise(function(resolve, reject) {
            RedisClient.client.del(tokenTable + tid, function(err, res) {
                err ? reject(err) : resolve(res);
            });
        });
    },

    /**
     * Generates a token for the user.
     * @param {Number} userID the ID of the user.
     * @returns {String} the generated token.
     */
    generateToken: function(userID) {
        return sign({
            id: userID,
            tid: uuid.v4()
        });
    }
};

auth.register.attributes = {
    name: 'auth',
    version: '0.0.1'
};

module.exports = auth;