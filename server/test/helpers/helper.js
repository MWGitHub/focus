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
var _ = require('lodash');

var seedUsers = require('../../data/db/seeds/a1-users').users;
var seedProjects = require('../../data/db/seeds/a2-projects').projects;
var seedBoards = require('../../data/db/seeds/a3-boards').boards;
var seedLists = require('../../data/db/seeds/a4-lists').lists;
var seedTasks = require('../../data/db/seeds/a5-tasks').tasks;

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
         * Seeded users in the database.
         * @type {{id: number, username: string, email: string, password: string, timezone: string}[]}
         */
        this.userSeeds = seedUsers;

        /**
         * Seeded projects in the database.
         * @type {{id: number, title: string, is_public: boolean}[]}
         */
        this.projectSeeds = seedProjects;

        /**
         * Seeded boards in the database.
         * @type {{id: number, project_id: number, title: string}[]}
         */
        this.boardSeeds = seedBoards;

        /**
         * Seeded lists in the database.
         * @type {{id: number, board_id: number, title: string}[]}
         */
        this.listSeeds = seedLists;

        /**
         * Seeded tasks in the database.
         * @type {{id: number, list_id: number, title: string, position: number}[]}
         */
        this.taskSeeds = seedTasks;
    }

    generateSeeds() {
        return co(function* () {
            // Set database sequence to not collide with seed ids
            yield Database.knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1');
            yield Database.knex.raw('ALTER SEQUENCE projects_id_seq RESTART WITH 1');
            yield Database.knex.raw('ALTER SEQUENCE project_permissions_id_seq RESTART WITH 1');
            yield Database.knex.raw('ALTER SEQUENCE boards_id_seq RESTART WITH 1');
            yield Database.knex.raw('ALTER SEQUENCE lists_id_seq RESTART WITH 1');
            yield Database.knex.raw('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');

            yield Database.knex.seed.run();

            // Set database sequence to not collide with seed ids
            yield Database.knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 10000');
            yield Database.knex.raw('ALTER SEQUENCE projects_id_seq RESTART WITH 10000');
            yield Database.knex.raw('ALTER SEQUENCE project_permissions_id_seq RESTART WITH 10000');
            yield Database.knex.raw('ALTER SEQUENCE boards_id_seq RESTART WITH 10000');
            yield Database.knex.raw('ALTER SEQUENCE lists_id_seq RESTART WITH 10000');
            yield Database.knex.raw('ALTER SEQUENCE tasks_id_seq RESTART WITH 10000');
        });
    }

    clearDatabase() {
        return co(function* () {
            yield Database.knex('project_permissions').del();
            yield Database.knex('tasks').del();
            yield Database.knex('lists').del();
            yield Database.knex('boards').del();
            yield Database.knex('projects').del();
            yield Database.knex('users').del();
        });
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

            yield instance.clearDatabase();
            yield instance.generateSeeds();

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
            yield instance.clearDatabase();

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

    /**
     * Clones and changes the authorization of a payload to the given user.
     * @param payload the payload to clone and change
     * @param user the user to change to
     * @returns {*|Promise}
     */
    changeHeaderAuth(payload, user) {
        return co(function* () {
            var clone = _.cloneDeep(payload);
            clone.headers.authorization = yield this.login(user);
            return clone;
        });
    }

    /**
     * Change the url with the given tokens.
     * @param {string} url the url to change.
     * @param {Object.<string, string>} tokens the strings to replace matching the keys.
     * @returns {string} the changed URL.
     */
    changeURL(url, tokens) {
        var str = url;
        for (let key in tokens) {
            if (!tokens.hasOwnProperty(key)) continue;
            str = str.replace('{' + key + '}', tokens[key]);
        }
        return str;
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