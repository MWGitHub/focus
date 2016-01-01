"use strict";
var co = require('co');

/**
 * Seed board objects.
 * @type {{id: number, project_id: number, title: string}[]}
 */
var boards = [];
for (let i = 0; i < 5; i++) {
    boards.push({
        id: i * 2,
        project_id: i,
        title: 'title' + (i * 2)
    });
    boards.push({
        id: i * 2 + 1,
        project_id: i,
        title: 'title' + (i * 2 + 1)
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