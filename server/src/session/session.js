/**
 * Creates, deletes, and validates sessions using redis as the storage.
 */
var JWT = require('jsonwebtoken');
var uuid = require('node-uuid');

var internals = {
    // Redis client to use for storing tokens
    redisClient: null,

    // Namespace for the tokens
    tokenTable: 'token:',

    // Sessions by default expire in one year
    expiration: 365 * 60 * 60 * 24 * 30,

    // Secret key for signing tokens
    key: null
};

/**
 * Sign data with JWT.
 * @param {*} data the data to sign.
 * @returns {String} the signed data.
 */
internals.sign = function(data) {
    return JWT.sign(data, internals.key);
};

/**
 * Checks if a given token is in the store.
 * @param {String} tid the ID of the token to find.
 * @returns {Promise} the promise with true if successful and false if not.
 */
internals.validate = function(tid) {
    return new Promise(function(resolve, reject) {
        internals.redisClient.get(internals.tokenTable + tid, function(err, reply) {
            if (err) return reject(err);
            if (reply) {
                return resolve(true);
            } else {
                return resolve(false);
            }
        });
    });
};

var session = {
    register: function(server, options, next) {
        "use strict";

        if (!options.redis) return next(new Error('options.redis requires a redis client or the plugin name and key.'));
        if (options.redis.client) {
            // Redis client given
            internals.redisClient = options.redis.client;
        } else {
            // Try to find a redis client from the given plugin name and key
            if (!options.redis.plugin) return next(new Error('options.redis requires a redis plugin name'));
            if (!options.redis.key) return next(new Error('options.redis requires a plugin key'));
            var plugin = server.plugins[options.redis.plugin];
            if (!plugin) return next(new Error('options.redis.plugin does not exist'));
            internals.redisClient = server.plugins[options.redis.plugin][options.redis.key];
        }
        if (!internals.redisClient) return next(new Error('redis client not found'));

        internals.key = options.key;
        if (!internals.key) return next(new Error('option.key is required'));

        internals.tokenTable = options.table || internals.tokenTable;
        internals.expiration = options.expiration || internals.expiration;

        server.expose('table', internals.tokenTable);
        server.expose('expiration', internals.expiration);

        // Add session support to an authentication plugin if provided
        if (options.auth && options.auth.plugin && options.auth.method) {
            server.plugins[options.auth.plugin][options.auth.method].call(this, internals.validate, 'tid');
        }

        next();
    },

    /**
     * Checks if a given token is in the store.
     * @param {String} tid the ID of the token to find.
     * @returns {Promise} the promise with true if successful and false if not.
     */
    validate: function(tid) {
        return internals.validate(tid);
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
        var ttl = duration || internals.expiration;
        if (ttl % 1 !== 0) throw new Error('Duration must be an integer.');
        var parsed = this.decodeToken(token);
        return new Promise(function(resolve, reject) {
            internals.redisClient.set(internals.tokenTable + parsed.data.tid, parsed.data.id, function(err, res) {
                internals.redisClient.expire(internals.tokenTable + parsed.data.tid, ttl);
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
            internals.redisClient.del(internals.tokenTable + id, function(err, res) {
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
        return internals.sign({
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