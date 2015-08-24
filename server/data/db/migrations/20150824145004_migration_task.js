
exports.up = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.dropColumn('duration');
        table.dropColumn('position');
        table.integer('before').references('tasks.id');
        table.integer('after').references('tasks.id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.integer('duration').notNullable();
        table.integer('position').notNullable();
        table.dropColumn('before');
        table.dropColumn('after');
    });
};
