
exports.up = function(knex, Promise) {
    return knex.schema.table('projects', function(table) {
        table.renameColumn('user_id', 'owner');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('projects', function(table) {
        table.renameColumn('owner', 'user_id');
    });
};
