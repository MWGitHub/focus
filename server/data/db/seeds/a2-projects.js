"use strict";
var co = require('co');
var PermissionModel = require('../../../src/permission/permission-model');

/**
 * Project seeds with odd projects as public.
 * @type {{id: number, title: string, is_public: boolean}[]}
 */
var projects = [];
for(let i = 0; i < 5; i++) {
    projects.push({
        id: i,
        title: 'title' + i,
        is_public: i % 2 === 1
    });
}

exports.seed = function(knex, Promise) {
    return co(function* () {
        // Deletes all existing entries
        yield knex('projects').del();
        yield knex('project_permissions').del();

        // Create projects for users to use with odd projects as public
        var i;
        for (i = 0; i < projects.length; i++) {
            yield knex('projects').insert(projects[i]);
        }

        // Make user 0 an admin of some projects
        for (i = 0; i <= 2; i++) {
            yield knex('project_permissions').insert({
                project_id: i,
                user_id: 0,
                role: PermissionModel.ProjectPermission.roles.admin
            });
        }

        // Make user 1 a member of some projects
        for (i = 1; i <= 3; i++) {
            yield knex('project_permissions').insert({
                project_id: i,
                user_id: 1,
                role: PermissionModel.ProjectPermission.roles.member
            });
        }

        // Make user 2 a viewer of some projects
        for (i = 2; i <= 4; i++) {
            yield knex('project_permissions').insert({
                project_id: i,
                user_id: 2,
                role: PermissionModel.ProjectPermission.roles.viewer
            });
        }
    });
};

/**
 * @type {{id: number, title: string, is_public: boolean}[]}
 */
exports.projects = projects;