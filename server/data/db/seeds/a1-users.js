"use strict";
var auth = require('../../../src/auth/auth');
var moment = require('moment-timezone');
var co = require('co');

/**
 * Seed users
 * @type {{id: number, username: string, email: string, password: string, timezone: string}[]}
 */
var users = [];
for (let i = 0; i < 5; i++) {
    users.push({
        id: i,
        username: 'seed' + i,
        email: 'seed' + i + '@example.com',
        password: 'seed' + i + 'pw',
        timezone: moment.tz.names()[i]
    });
}

/**
 * Create and insert a user into the database.
 * @param knex
 * @param user the user to insert.
 * @returns {Promise.<T>}
 */
function createUser(knex, user) {
    return auth.hash(user.password).then(function(hash) {
        return knex('users').insert({
            id: user.id,
            username: user.username,
            password: hash,
            email: user.email,
            timezone: user.timezone
        });
    });
}

exports.seed = function(knex, Promise) {
    return co(function* () {
        // Deletes ALL existing entries
        yield knex('users').del();

        // Inserts seed entries
        for (let i = 0; i < users.length; i++) {
            yield createUser(knex, users[i]);
        }
    });
};

/**
 * Seed users
 * @type {{id: number, username: string, email: string, password: string, timezone: string}[]}
 */
exports.users = users;