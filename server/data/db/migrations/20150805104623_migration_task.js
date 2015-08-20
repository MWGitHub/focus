
exports.up = function(knex, Promise) {
  return knex.schema.table('tasks', function(table) {
      "use strict";
      table.integer('list_id').notNullable().references('lists.id');
      table.integer('duration').notNullable();
      table.dateTime('started_at');
      table.integer('age').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('tasks', function(table) {
      "use strict";
      table.dropColumn('list_id');
      table.dropColumn('duration');
      table.dropColumn('started_at');
      table.dropColumn('age');
  });
};
