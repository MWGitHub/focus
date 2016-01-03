"use strict";
var co = require('co');

/**
 * Seed list objects.
 * @type {{id: number, list_id: number, title: string, position: number}[]}
 */
var tasks = [];
for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 3; j++) {
        tasks.push({
            id: i * 3 + j,
            list_id: i,
            title: 'title' + (i * 3 + j),
            position: i * 3 + j
        });
    }
}

exports.seed = function(knex, Promise) {
    return co(function* () {
        // Deletes all existing entries
        yield knex('tasks').del();

        // Create boards for the projects
        for (let i = 0; i < tasks.length; i++) {
            yield knex('tasks').insert(tasks[i]);
        }
    });
};

/**
 * @type {{id: number, list_id: number, title: string, position: number}[]}
 */
exports.tasks = tasks;