/**
 * Permission models for models that require them.
 */
var Bookshelf = require('../lib/bookshelf');
var User = require('../models/user');
var Project = require('../models/project');
var Board = require('../models/board');

var ProjectPermission = Bookshelf.Model.extend({
    tableName: 'project_permissions',

    user: function() {
        return this.belongsTo(User);
    },

    project: function() {
        return this.belongsTo(Project);
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        role: {type: 'string', notNullable: true},
        project_id: {type: 'integer', notNullable: true},
        user_id: {type: 'integer', notNullable: true}
    },
    /**
     * Roles give the following permissions:
     *  admin: delete/update project, CRUD board, CRUD lists, CRUD tasks
     *  member: CRUD board, CRUD lists, CRUD tasks
     *  viewer: read only permissions
     */
    roles: {
        admin: 'admin',
        member: 'member',
        viewer: 'viewer'
    }
});

module.exports = {
    ProjectPermission: ProjectPermission
};