"use strict";
var co = require('co');

/**
 * Seed board objects.
 * @type {{id: number, project_id: number, title: string}[]}
 */
var boards = [];
for (let i = 0; i < 10; i++) {
    boards.push({
        id: i,
        project_id: i % 5,
        title: 'title' + i
    });
}

exports.seed = function(knex, Promise) {
    return co(function* () {
        // Deletes all existing entries
        yield knex('boards').del();

        // Create boards for the projects
        for (let i = 0; i < boards.length; i++) {
            yield knex('boards').insert(boards[i]);
        }
    });
};

/**
 * @type {{id: number, project_id: number, title: string}[]}
 */
exports.boards = boards;