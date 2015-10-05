
exports.up = function(knex, Promise) {
    return knex.schema.createTable('projects', function(table) {
        "use strict";
        table.increments('id').notNullable().primary();
        table.string('title', 150).notNullable();
        table.integer('user_id').notNullable().references('users.id');
    });
};

exports.down = function(knex, Promise) {
    "use strict";
    return knex.schema.dropTable('projects');
};
