/**
 * Handles if data should be updated.
 */

var redis = require('../lib/redis-client');

var staleTable = 'stale:';
var ttl = 60 * 60 * 24;

var stale = {
    /**
     * Set the general update time to now.
     * @param {String} bid the board ID.
     * @returns {Promise}
     */
    touch: function(bid) {
        return new Promise(function(resolve, reject) {
            redis.client.set(staleTable + bid, new Date().getTime(), function(err, res) {
                redis.client.expire(staleTable + bid, ttl);
                err ? reject(err) : resolve(res);
            });
        });
    }
};

module.exports = stale;