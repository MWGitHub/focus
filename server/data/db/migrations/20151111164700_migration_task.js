
exports.up = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.json('data', true);
        table.dropColumn('user_id');
        table.dropColumn('age');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.dropColumn('data');
        table.integer('age').notNullable();
        table.integer('user_id').notNullable().references('users.id');
    });
};
