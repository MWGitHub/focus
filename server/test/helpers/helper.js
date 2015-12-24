"use strict";

var Database = require('../../src/lib/database');
var User = require('../../src/models/user');
var API = require('../../src/lib/api');
var Auth = require('../../src/auth/auth');
var Server = require('../../src/server');
var co = require('co');
var Config = require('../../config.json');
var Knexfile = require('../../knexfile');
var moment = require('moment-timezone');

/**
 * Helper instance that holds server state until after is run.
 */
class Helper {
    constructor() {
        /**
         * Server API route.
         * @type {string}
         */
        this.apiRoute = Config.apiRoute;

        /**
         * Server to inject into.
         * @type {Server}
         */
        this.server = null;

        /**
         * Seeded users in the database
         * @type {{
         *  id: number,
         *  username: string,
         *  email: string,
         *  password: string,
         *  timezone: string
         * }[]}
         */
        this.userSeeds = [];
        var i;
        for (i = 0; i < 5; i++) {
            this.userSeeds.push({
                id: i,
                username: 'seed' + i,
                email: 'seed' + i + '@example.com',
                password: 'seed' + i + 'pw',
                timezone: moment.tz.names()[i]
            });
        }

        /**
         * Seeded projects in the database
         * @type {{
         *  id: number,
         *  title: string,
         *  is_public: boolean
         * }}
         */
        this.projectSeeds = [];
        for (i = 0; i < 5; i++) {
            this.projectSeeds.push({
                id: i,
                title: 'title' + i,
                is_public: i % 2 === 1
            });
        }
    }

    /**
     * Sets up the server.
     * @returns {*|Promise}
     */
    startup() {
        this.server = new Server(Config, Knexfile);
        var instance = this;
        return co(function* () {
            process.env.NODE_ENV = 'test';

            yield Database.knex.migrate.latest();

            // Set database sequence to not collide with seed ids
            yield Database.knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1');
            yield Database.knex.raw('ALTER SEQUENCE projects_id_seq RESTART WITH 1');
            yield Database.knex.raw('ALTER SEQUENCE project_permissions_id_seq RESTART WITH 1');

            yield Database.knex.seed.run();

            // Set database sequence to not collide with seed ids
            yield Database.knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 10000');
            yield Database.knex.raw('ALTER SEQUENCE projects_id_seq RESTART WITH 10000');
            yield Database.knex.raw('ALTER SEQUENCE project_permissions_id_seq RESTART WITH 10000');

            yield instance.server.initialize();
            return instance.server;
        }).catch(function(e) {
            console.error(e);
        });
    }

    /**
     * Destroys and reverts persistent changes to the server.
     * @returns {*|Promise}
     */
    teardown() {
        var instance = this;
        return co(function* () {
            // Delete all data
            yield Database.knex('project_permissions').del();
            yield Database.knex('tasks').del();
            yield Database.knex('lists').del();
            yield Database.knex('boards').del();
            yield Database.knex('projects').del();
            yield Database.knex('users').del();

            if (instance.server) {
                yield instance.server.stop();
                instance.server = null;
            }
        }).catch(function(e) {
            console.error(e);
        });
    }

    /**
     * Logs a user in.
     * @param {string|{username: string, password: string}} login the user name, email, or user object.
     * @param {string=} password the password of the user, required if login is not a user object.
     * @param {boolean=} asResponse set to true to return the result as a response.
     * @returns {Promise} the promise with the token response or error if not found.
     */
    login(login, password, asResponse) {
        let promise = null;
        if (login instanceof Object) {
            promise = this.inject({
                method: 'POST',
                url: this.apiRoute + '/users/login',
                payload: {
                    login: login.username,
                    password: login.password
                }
            })
        } else {
            promise = this.inject({
                method: 'POST',
                url: this.apiRoute + '/users/login',
                payload: {
                    login: login,
                    password: password
                }
            })
        }
        return promise.then(function(response) {
            if (!asResponse && response.statusCode === Helper.Status.valid) {
                return response.result.data.token;
            } else {
                return response;
            }
        });
    }

    /**
     * Injects as a promise.
     * @param {*} data the data to inject.
     * @returns {Promise} the promise with the response.
     */
    inject(data) {
        var server = this.server.server;
        return new Promise(function (resolve, reject) {
            server.inject(data, function (response) {
                resolve(response);
            });
        });
    }
}

Helper.Status = {
    valid: 200,
    error: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    taken: 440,
    internal: 500
};

module.exports = Helper;