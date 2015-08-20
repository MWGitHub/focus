
exports.up = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        "use strict";
        table.integer('user_id').notNullable().references('users.id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('tasks', function(table) {
        "use strict";
        table.dropColumn('user_id');
    });
};
