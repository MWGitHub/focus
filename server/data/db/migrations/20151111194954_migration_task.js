
exports.up = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.dropColumn('extra');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.boolean('extra').defaultTo(false);
    });
};
