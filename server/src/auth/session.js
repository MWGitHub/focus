var RedisClient = require('../lib/redis-client');
var JWT = require('jsonwebtoken');
var uuid = require('node-uuid');

// Namespace for the tokens
var tokenTable = 'token:';
// Sessions by default expire in 30 days
var expiration = 60 * 60 * 24 * 30;
// Secret key for signing tokens
var key;

/**
 * Sign data with JWT.
 * @param {*} data the data to sign.
 * @returns {String} the signed data.
 */
function sign(data) {
    return JWT.sign(data, key);
}

var session = {
    register: function(server, options, next) {
        "use strict";

        key = options.key;
        if (!key) throw new Error('option.key is required');

        tokenTable = options.table || tokenTable;
        expiration = options.expiration || expiration;

        next();
    },

    /**
     * Checks if a given token is in the store.
     * @param {String} id the ID of the token to find.
     * @returns {Promise} the promise with true if successful and throws an error if not.
     */
    validate: function(id) {
        return new Promise(function(resolve, reject) {
            RedisClient.client.get(tokenTable + id, function(err, reply) {
                if (err) reject(err);
                if (reply) {
                    return resolve(true);
                } else {
                    return reject(new Error('failed to find token'));
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

    /**
     * Begin a session.
     * @param {String} token the token
     * @param duration
     * @returns {Promise}
     */
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

    /**
     * @param {string} id the ID of the token.
     * @returns {Promise}
     */
    logout: function(id) {
        return new Promise(function(resolve, reject) {
            RedisClient.client.del(tokenTable + id, function(err, res) {
                err ? reject(err) : resolve(res);
            });
        });
    },

    /**
     * Generates a token with an id.
     * @param {Number} id the id associated with the token.
     * @returns {String} the generated token.
     */
    generateToken: function(id) {
        return sign({
            id: id,
            tid: uuid.v4()
        });
    }
};

session.register.attributes = {
    name: 'session',
    version: '0.1.0'
};

module.exports = session;