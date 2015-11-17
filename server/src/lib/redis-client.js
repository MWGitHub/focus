var redis = require('redis');
var config = require('../../config.json');

var redisClient = {
    register: function(server, options, next) {
        var db = options.db || 0;

        server.log('info', 'Connecting to redis');
        this.client = redis.createClient();
        var client = this.client;

        client.on('ready', function() {
            server.log('info', 'Redis connection established');

            client.select(db, function() {
                server.log('info', 'Using redis database ' + db);
                next();
            });
        });

        var isRegistering = true;
        client.on('error', function(err) {
            server.log('error', err.message);
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