var Hapi = require('hapi');
var Good = require('good');
var Boom = require('boom');
var co = require('co');
var RedisClient = require('./lib/redis-client');
var Config = require('../config.json');
var Routes = require('./routes/routes');

var Auth = require('./auth/auth');
var Session = require('./auth/session');
var Stale = require('./lib/stale');

// Connect to the database
var bookshelf = require('./lib/bookshelf');

var Server = {
    /**
     * The server instance.
     */
    server: null,

    /**
     * Flag for if the server is running.
     */
    isRunning: false,

    /**
     * Initializes the server.
     * @returns {*|Promise}
     */
    initialize: function() {
        var instance = this;
        return co(function* () {
            // Set the server options
            var options = {
                connections: {
                    router: {
                        isCaseSensitive: false,
                        stripTrailingSlash: true
                    }
                }
            };

            // Set the server plugins
            var plugins = [
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
                    register: RedisClient,
                    options: {
                        db: 0
                    }
                },
                {
                    register: Auth,
                    options: {
                        key: Config.authkey
                    }
                },
                {
                    register: Session,
                    options: {
                        redis: {
                            plugin: 'redis-client',
                            key: 'client'
                        },
                        key: Config.authkey
                    }
                },
                {
                    register: Stale,
                    options: {
                        redis: {
                            plugin: 'redis-client',
                            key: 'client'
                        }
                    }
                }
            ];

            // Create the server
            console.log('Creating server...');
            instance.server = new Hapi.Server(options);
            var server = instance.server;
            server.connection({
                host: Config.host,
                port: Config.port
            });

            // Register plugins
            yield new Promise(function(resolve, reject) {
                server.register(plugins, function(err) {
                    "use strict";
                    if (err) {
                        reject(err);
                    } else {
                        resolve(server);
                    }
                });
            });

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

            // Initialize the server
            yield new Promise(function(resolve, reject) {
                // Start the server
                server.initialize(function(err) {
                    "use strict";
                    if (err) {
                        reject(err);
                    } else {
                        server.log('info', 'Server initialized');
                        resolve(server);
                    }
                });
            });

            return server;
        }, function(err) {
            throw err;
        });
    },

    /**
     * Start the server.
     * @returns {*|Promise}
     */
    start: function() {
        var instance = this;
        return this.initialize().then(function(server) {
            // Only allow one instance of the server to be running.
            if (instance.isRunning) return instance.server;

            return new Promise(function(resolve, reject) {
                server.start(function(err) {
                    "use strict";
                    if (err) {
                        reject(err);
                    } else {
                        instance.isRunning = true;
                        server.log('info', 'Started running at: ' + server.info.uri);
                        resolve(server);
                    }
                });
            });
        });
    },

    stop: function() {
        if (!this.server) return Promise.resolve(true);

        var instance = this;
        return new Promise(function(resolve, reject) {
            instance.server.stop(function(err) {
                if (err) {
                    reject(err);
                } else {
                    instance.isRunning = false;
                    console.log('Server stopped');
                    resolve();
                }
            });
        });
    }
};

module.exports = Server;