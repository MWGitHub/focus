
exports.up = function(knex, Promise) {
    return knex.schema.createTable('lists', function(table) {
        "use strict";
        table.increments('id').notNullable().primary();
        table.string('title', 150).notNullable();
        table.integer('board_id').notNullable().references('boards.id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('lists');
};
