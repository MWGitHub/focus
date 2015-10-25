var co = require('co');
var moment = require('moment-timezone');

exports.up = function(knex, Promise) {
    "use strict";

    var isRollingBack = false;
    return knex.raw('BEGIN;')
        .then(function() {
            return knex.schema.table('boards', function(table) {
                table.integer('project_id').references('projects.id');
            });
        })
        .then(function() {
            return knex.select().table('boards')
        })
        .then(function(boards) {
            // Create projects
            var promises = [];
            for (var i = 0; i < boards.length; i++) {
                promises.push(
                    knex('projects').insert({
                        title: boards[i].title,
                        user_id: boards[i].user_id,
                        created_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSZZ'),
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss.SSSZZ')
                    })
                );
            }
            return Promise.all(promises);
        })
        .then(function() {
            return knex.select().table('projects');
        })
        .then(function(projects) {
            return knex.raw('SELECT boards.id AS bid, projects.id AS pid FROM boards INNER JOIN projects ON boards.user_id = projects.user_id');
        })
        .then(function(join) {
            // Match projects to boards
            var rows = join.rows;
            var promises = [];
            for (var i = 0; i < rows.length; i++) {
                promises.push(
                    knex('boards')
                        .where('id', '=', rows[i].bid)
                        .update({
                            project_id: rows[i].pid
                        })
                );
            }
            return Promise.all(promises);
        })
        .then(function() {
            // Make project_id required
            return knex.raw('ALTER TABLE boards ALTER COLUMN project_id SET NOT NULL');
        })
        .then(function() {
            return knex.raw('COMMIT');
        })
        .catch(function(e) {
            isRollingBack = true;
            console.log(e);
            return knex.raw('ROLLBACK;');
        })
        .then(function() {
            if (isRollingBack) {
                throw new Error('Failed, rolling back');
            }
        });
};

exports.down = function(knex, Promise) {
    "use strict";
    return knex.schema.table('boards', function(table) {
        table.dropColumn('project_id');
    });
};
