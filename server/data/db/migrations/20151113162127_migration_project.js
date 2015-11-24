
exports.up = function(knex, Promise) {
    return knex.raw(
        "INSERT INTO project_permissions (user_id, project_id, role) SELECT user_id, id AS project_id, 'admin' as role FROM projects;"
    ).then(function() {
        return knex.schema.table('projects', function (table) {
            table.dropColumn('user_id');
        });
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('projects', function(table) {
        table.integer('user_id').notNullable().references('users.id');
    });
};
