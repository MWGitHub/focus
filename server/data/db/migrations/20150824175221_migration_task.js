
exports.up = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.decimal('position', 65, 30).notNullable().defaultTo(0);
        table.dropColumn('before');
        table.dropColumn('after');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.dropColumn('position');
        table.integer('before').references('tasks.id');
        table.integer('after').references('tasks.id');
    });
};
