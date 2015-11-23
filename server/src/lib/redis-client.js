var redis = require('redis');
var config = require('../../config.json');
var logger = require('./logger');

var redisClient = {
    register: function(server, options, next) {
        var db = options.db || 0;

        logger.info('Connecting to redis');
        this.client = redis.createClient();
        var client = this.client;

        client.on('ready', function() {
            logger.info('Redis connection established');

            client.select(db, function() {
                logger.info('Using redis database ' + db);
                next();
            });
        });

        var isRegistering = true;
        client.on('error', function(err) {
            logger.error(err.message);
            if (isRegistering) {
                client.end();
                next();
                isRegistering = false;
            }
        });

        // Allow other plugins and logic to retrieve the client
        server.expose('client', client);
    }
};

redisClient.register.attributes = {
    name: 'redis-client',
    version: '1.0.0'
};

module.exports = redisClient;