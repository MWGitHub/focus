
exports.up = function(knex, Promise) {
    return knex.schema.table('lists', function(table) {
        "use strict";
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('lists', function(table) {
        "use strict";
        table.dropTimestamps();
    });
};
