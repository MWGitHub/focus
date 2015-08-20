
exports.up = function(knex, Promise) {
    return knex.schema.table('lists', function(table) {
        "use strict";
        // Add the column
        table.integer('user_id').notNullable().references('users.id');
        //table.integer('user_id').notNullable().references('users.id').defaultTo(0);

        // Modify the owner to the real owner
        /*
        var userWrap = function(userID, boardID) {
            return knex('lists').where({board_id: boardID})
                .update({
                    user_id: userID
                });
        };

        return knex('boards').then(function(boards) {
            var promises = [];
            for (var i = 0; i < boards.length; i++) {
                promises.push(userWrap(boards[i].user_id, boards[i].id));
            }
            return Promise.all(promises);
        });
        */
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('lists', function(table) {
        "use strict";
        table.dropColumn('user_id');
    });
};
