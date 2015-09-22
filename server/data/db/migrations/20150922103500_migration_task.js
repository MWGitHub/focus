
exports.up = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.dropColumn('temporary');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        table.boolean('temporary').defaultTo(false);
    })
};
