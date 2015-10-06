var Hapi = require('hapi');
var Good = require('good');
var Boom = require('boom');
var RedisClient = require('./src/lib/redis-client');
var Config = require('./config.json');
var Routes = require('./src/routes/routes');

var Auth = require('./src/auth/auth');
var Session = require('./src/auth/session');

// Connect to the database
var bookshelf = require('./src/lib/bookshelf');

// Retrieve the port from the arguments if given
var args = process.argv.slice(2);
var host = Config.host;
var port = Config.port;

// Create a server with a host and port
var options = {
    connections: {
        router: {
            isCaseSensitive: false,
            stripTrailingSlash: true
        }
    }
};

var server = new Hapi.Server(options);
server.connection({
    host: host,
    port: port
});

// Register plugins
server.register([
    {
        register: Good,
        options: {
            reporters: [{
                reporter: require('good-console'),
                events: {
                    response: '*',
                    log: '*'
                }
            }]
        }
    },
    {
        register: Auth
    },
    {
        register: Session,
        options: {
            key: Config.authkey
        }
    }
], function(err) {
    "use strict";
    if (err) {
        throw err;
    }

    // Route all routes that are not plugins.
    Routes.addRoutes(server);

    // 404 response if a route is not matched.
    server.route({
        method: '*',
        path: '/{p*}',
        handler: function(request, reply) {
            reply(Boom.notFound('Page ' + request.path + ' does not exist'));
        }
    });

    // Start the server
    RedisClient.connect().then(function() {
        server.start(function() {
            "use strict";
            server.log('info', 'Starting running at: ' + server.info.uri);
        });
    });
});

module.exports = server;