"use strict";
var co = require('co');

exports.up = function(knex, Promise) {
    return co(function* () {
        // Move the position to the json field
        yield knex.raw([
            'UPDATE tasks AS t1',
            'SET data = (',
                "SELECT concat('{\"position\":', position, '}')::jsonb FROM tasks AS t2 WHERE t1.id = t2.id",
            ')'
        ].join(' '));

        return knex.schema.table('tasks', function(table) {
            table.dropColumn('position');
        });
    });
};

exports.down = function(knex, Promise) {
    return co(function* () {
        return knex.schema.table('tasks', function(table) {
            table.decimal('position', 65, 30).notNullable().defaultTo(0);
        }).then(function() {
            return knex.raw([
                'UPDATE tasks AS t1',
                "SET position = (",
                    "SELECT CAST(data->>'position' AS numeric) FROM tasks AS t2 WHERE t1.id = t2.id",
                ')'
            ].join(' '));
        }).then(function() {
            return knex('tasks').update({data: null});
        });
    });
};
