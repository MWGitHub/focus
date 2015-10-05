
exports.up = function(knex, Promise) {
    return knex.schema.table('boards', function(table) {
        "use strict";
        table.integer('project_id').nullable().references('projects.id');
    });
};

exports.down = function(knex, Promise) {
    "use strict";
    return knex.schema.table('boards', function(table) {
        table.dropColumn('project_id');
    });
};
