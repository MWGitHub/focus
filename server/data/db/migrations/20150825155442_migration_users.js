exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.dateTime('lastupdate');
        table.string('timezone', 150).notNullable(true).defaultTo('America/New_York');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('timezone');
        table.dropColumn('lastupdate');
    });
};
