/**
 * Permission models for models that require them.
 */
var Bookshelf = require('../lib/database').bookshelf;
require('../models/user');
require('../models/project');

var ProjectPermission = Bookshelf.Model.extend({
    tableName: 'project_permissions',

    user: function() {
        return this.belongsTo('User');
    },

    project: function() {
        return this.belongsTo('Project');
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
    },

    retrievals: {
        all: [
            {name: 'user_id'},
            {name: 'project_id'},
            {name: 'role'}
        ]
    }
});

module.exports = {
    ProjectPermission: Bookshelf.model('ProjectPermission', ProjectPermission)
};