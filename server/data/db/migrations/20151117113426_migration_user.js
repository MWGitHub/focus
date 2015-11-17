
exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('lastupdate');
        table.string('email');
        table.boolean('verified').defaultTo(false).notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.dateTime('lastupdate');
        table.dropColumn('email');
        table.dropColumn('verified');
    });
};
