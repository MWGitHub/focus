/**
 * Stores the update time of inputs and checks if an item has been updated.
 */

// Redis client to store data in
var redisClient;
// Namespace for stale items
var staleTable = 'stale:';
// Expiration date on stale items set to 1 day by default
var ttl = 60 * 60 * 24;

var stale = {
    register: function(server, options, next) {
        if (!options.redis) {
            next(new Error('options.redis requires a redis client or the plugin name and key.'));
            return;
        }
        if (options.redis.client) {
            redisClient = options.redis.client;
        } else {
            if (!options.redis.plugin) {
                next(new Error('options.redis requires a redis plugin name'));
                return;
            }
            if (!options.redis.key) {
                next(new Error('options.redis requires a plugin key'));
                return;
            }
            redisClient = server.plugins[options.redis.plugin][options.redis.key];
        }
        if (!redisClient) {
            next(new Error('redis client not found'));
            return;
        }

        staleTable = options.table || staleTable;
        ttl = options.expiration || ttl;

        next();
    },

    /**
     * Set the general update time to now.
     * @param {String} bid the board ID.
     * @returns {Promise}
     */
    touch: function(bid) {
        return new Promise(function(resolve, reject) {
            redisClient.set(staleTable + bid, new Date().getTime(), function(err, res) {
                redisClient.expire(staleTable + bid, ttl);
                err ? reject(err) : resolve(res);
            });
        });
    },

    /**
     * Retrieves the staleness of a board.
     * @param {String} bid the board ID.
     * @returns {Promise}
     */
    getStaleness: function(bid) {
        return new Promise(function(resolve, reject) {
            redisClient.get(staleTable + bid, function(err, reply) {
                if (err) {
                    reject(err);
                } else {
                    resolve(reply);
                }
            });
        })
    }
};
stale.register.attributes = {
    name: 'stale',
    version: '0.1.0'
};

module.exports = stale;