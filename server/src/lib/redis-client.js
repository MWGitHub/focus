var redis = require('redis');
var config = require('../../config.json');

var client = {
    client: null,

    connect: function(cb) {
        var instance = this;
        return new Promise(function(resolve, reject) {
            console.log('Connecting to redis');
            instance.client = redis.createClient();
            var client = instance.client;
            client.select(config.redisDB, function() {
                console.log('Using redis database %d', config.redisDB);
            });
            client.on('ready', function() {
                console.log('Redis connection established');
                if (cb) {
                    resolve(cb(instance.client));
                } else {
                    resolve(instance.client);
                }
            });
            client.on('error', function(err) {
                console.error('Error ' + err);
                reject(err);
            });
        });
    }
};

module.exports = client;