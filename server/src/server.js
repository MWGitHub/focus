"use strict";

var Hapi = require('hapi');
var Good = require('good');
var Boom = require('boom');
var co = require('co');
var RedisClient = require('./lib/redis-client');
var database = require('./lib/database');
var Session = require('./session/session');
var Permission = require('./permission/permission');
var Routes = require('./routes/routes');
var Auth = require('./auth/auth');
var Stale = require('./lib/stale');
var logger = require('./lib/logger');


class Server {
    /**
     * Creates the server.
     * @param config the configuration file to use for the server.
     */
    constructor(config) {
        /**
         * The server instance.
         */
        this._server = null;

        /**
         * Flag for if the server is running.
         */
        this._isRunning = false;

        /**
         * Configuration file to use for the server.
         */
        this._config = config;
    }

    /**
     * Initializes the server.
     * @returns {*|Promise}
     */
    initialize() {
        var instance = this;
        var config = this._config;
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
                    register: RedisClient,
                    options: {
                        db: 0
                    }
                },
                {
                    register: Session,
                    options: {
                        redis: {
                            plugin: 'redis-client',
                            key: 'client'
                        },
                        key: config.authkey
                    }
                },
                {
                    register: Permission
                },
                {
                    register: Auth,
                    options: {
                        session: {
                            validate: Session.validate,
                            key: 'tid'
                        },
                        permission: {
                            scope: Permission.getScope
                        },
                        key: config.authkey
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
            if (config.logLevel == 'debug') {
                plugins.unshift({
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
                });
            }

            // Create the server
            logger.info('Creating server...');
            instance._server = new Hapi.Server(options);
            var server = instance._server;
            server.connection({
                host: config.host,
                port: config.port
            });

            // Register plugins
            yield new Promise(function(resolve, reject) {
                server.register(plugins, function(err) {
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
                    if (err) {
                        reject(err);
                    } else {
                        logger.info('Server initialized');
                        resolve(server);
                    }
                });
            });

            return server;
        }, function(err) {
            throw err;
        });
    }

    /**
     * Start the server.
     * @returns {*|Promise}
     */
    start() {
        var instance = this;
        return this.initialize().then(function(server) {
            // Only allow one instance of the server to be running.
            if (instance._isRunning) return instance._server;

            return new Promise(function(resolve, reject) {
                server.start(function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        instance._isRunning = true;
                        logger.info('Started running at: ' + server.info.uri);
                        resolve(server);
                    }
                });
            });
        });
    }

    /**
     * Stop the server.
     * @returns {*|Promise}
     */
    stop() {
        if (!this._server) return Promise.resolve(true);

        var instance = this;
        return new Promise(function(resolve, reject) {
            instance.server.stop(function(err) {
                if (err) {
                    reject(err);
                } else {
                    instance._server = null;
                    instance._isRunning = false;
                    logger.info('Server stopped');
                    resolve();
                }
            });
        });
    }

    get server() {
        return this._server;
    }

    get isRunning() {
        return this._isRunning;
    }
}

module.exports = Server;