
exports.up = function(knex, Promise) {
    return knex.schema.createTable('board_permissions', function(table) {
        table.increments('id').notNullable().primary();
        table.string('role', 300).notNullable();
        table.integer('user_id').notNullable().references('users.id').index();
        table.integer('board_id').notNullable().references('boards.id').index();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('board_permissions');
};
