"use strict";
var co = require('co');

/**
 * Seed list objects.
 * @type {{id: number, project_id: number, title: string}[]}
 */
var lists = [];
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 3; j++) {
        lists.push({
            id: i * 3 + j,
            board_id: i,
            title: 'title' + (i * 3 + j)
        });
    }
}

exports.seed = function(knex, Promise) {
    return co(function* () {
        // Deletes all existing entries
        yield knex('lists').del();

        // Create boards for the projects
        for (let i = 0; i < lists.length; i++) {
            yield knex('lists').insert(lists[i]);
        }
    });
};

/**
 * @type {{id: number, board_id: number, title: string}[]}
 */
exports.lists = lists;