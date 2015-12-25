
exports.up = function(knex, Promise) {
    return knex.schema.table('boards', function(table) {
        table.dropColumn('user_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('boards', function(table) {
        table.integer('user_id').notNullable().references('users.id');
    });
};
