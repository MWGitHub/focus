
exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        "use strict";
        table.timestamps();
    });
  
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table) {
        "use strict";
        table.dropTimestamps();
    });
};
