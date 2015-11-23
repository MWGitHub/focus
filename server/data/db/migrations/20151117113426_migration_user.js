
exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('lastupdate');
        table.string('email').unique().index();
        table.boolean('verified').defaultTo(false).notNullable();
    }).then(function() {
        return knex.raw('CREATE INDEX ON users ((lower(username)))');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        table.dateTime('lastupdate');
        table.dropColumn('email');
        table.dropColumn('verified');
    }).then(function() {
        return knex.raw('DROP INDEX users_lower_idx');
    });
};
