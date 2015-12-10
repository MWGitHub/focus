var auth = require('../../../src/auth/auth');
var moment = require('moment-timezone');
var co = require('co');

function createUser(knex, id, name, email, password, timezone) {
    return auth.hash(password).then(function(hash) {
        return knex('users').insert({
            id: id,
            username: name,
            password: hash,
            email: email,
            timezone: timezone
        });
    });
}

exports.seed = function(knex, Promise) {
    return co(function* () {
        // Deletes ALL existing entries
        yield knex('users').del();

        // Inserts seed entries
        for (var i = 0; i < 5; i++) {
            yield createUser(knex, i, 'seed' + i, 'seed' + i + '@example.com', 'seed' + i + 'pw', moment.tz.names()[i]);
        }
    });
};
