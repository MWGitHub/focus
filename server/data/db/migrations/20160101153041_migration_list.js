
exports.up = function(knex, Promise) {
    return knex.schema.table('lists', function(table) {
        table.dropColumn('user_id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('lists', function(table) {
        table.integer('user_id').notNullable().references('users.id');
    });
};
