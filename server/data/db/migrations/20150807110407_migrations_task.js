
exports.up = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        "use strict";
        table.integer('position').notNullable();
        table.datetime('completed_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        "use strict";
        table.dropColumn('position');
        table.dropColumn('completed_at');
    });
};
