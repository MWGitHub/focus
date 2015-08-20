exports.up = function(knex, Promise) {
    return knex.schema.
        createTable('tasks', function(table) {
            "use strict";
            table.increments('id').notNullable().unique();
            table.string('title', 150).notNullable();
        });
};

exports.down = function(knex, Promise) {
    return knex.schema.
        dropTable('tasks')
};
