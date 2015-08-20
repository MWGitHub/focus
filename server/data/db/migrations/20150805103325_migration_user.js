
exports.up = function(knex, Promise) {
    "use strict";
    return knex.schema.createTable('users', function(table) {
        table.increments('id').notNullable().primary();
        table.string('username', 30).notNullable().unique();
        table.string('password', 60).notNullable();
    });
};

exports.down = function(knex, Promise) {
    "use strict";
    return knex.schema.dropTable('users');
};
