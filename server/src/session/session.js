/**
 * Creates, deletes, and validates sessions using redis as the storage.
 */
var JWT = require('jsonwebtoken');
var uuid = require('node-uuid');

// Redis client to use for storing tokens
var redisClient;
// Namespace for the tokens
var tokenTable = 'token:';
// Sessions by default expire in one year
var expiration = 365 * 60 * 60 * 24 * 30;
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

        if (!options.redis) return next(new Error('options.redis requires a redis client or the plugin name and key.'));
        if (options.redis.client) {
            // Redis client given
            redisClient = options.redis.client;
        } else {
            // Try to find a redis client from the given plugin name and key
            if (!options.redis.plugin) return next(new Error('options.redis requires a redis plugin name'));
            if (!options.redis.key) return next(new Error('options.redis requires a plugin key'));
            var plugin = server.plugins[options.redis.plugin];
            if (!plugin) return next(new Error('options.redis.plugin does not exist'));
            redisClient = server.plugins[options.redis.plugin][options.redis.key];
        }
        if (!redisClient) return next(new Error('redis client not found'));

        key = options.key;
        if (!key) return next(new Error('option.key is required'));

        tokenTable = options.table || tokenTable;
        expiration = options.expiration || expiration;

        server.expose('table', tokenTable);
        server.expose('expiration', expiration);

        next();
    },

    /**
     * Checks if a given token is in the store.
     * @param {String} tid the ID of the token to find.
     * @returns {Promise} the promise with true if successful and false if not.
     */
    validate: function(tid) {
        return new Promise(function(resolve, reject) {
            redisClient.get(tokenTable + tid, function(err, reply) {
                if (err) return reject(err);
                if (reply) {
                    return resolve(true);
                } else {
                    return resolve(false);
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
     * @param {String} token the token.
     * @param {Number?} duration the duration in seconds as an integer.
     * @returns {Promise}
     */
    login: function(token, duration) {
        var ttl = duration || expiration;
        if (ttl % 1 !== 0) throw new Error('Duration must be an integer.');
        var parsed = this.decodeToken(token);
        return new Promise(function(resolve, reject) {
            redisClient.set(tokenTable + parsed.data.tid, parsed.data.id, function(err, res) {
                redisClient.expire(tokenTable + parsed.data.tid, ttl);
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
            redisClient.del(tokenTable + id, function(err, res) {
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
    version: '1.0.0'
};

module.exports = session;