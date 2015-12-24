/**
 * Permission models for models that require them.
 */
var Bookshelf = require('../lib/database').bookshelf;
var ModelUtil = require('../lib/model-util');
require('../models/user');
require('../models/project');

var ProjectPermission = Bookshelf.Model.extend({
    tableName: 'project_permissions',

    user: function() {
        return this.belongsTo('User');
    },

    project: function() {
        return this.belongsTo('Project');
    },

    /**
     * Retrieves the data of the permission.
     * @param {{name: string, obj: *}[]} columns the columns to retrieve or all if none specified.
     * @return {Promise} the promise with the data.
     */
    retrieve: function(columns) {
        return ModelUtil.retrieve(this.tableName, this.get('id'), this, columns);
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

    getRetrievals() {
        var User = Bookshelf.model('User');
        var Project = Bookshelf.model('Project');
        return {
            all: [
                {name: 'user_id', title: 'user', obj: User.getRetrievals().guest},
                {name: 'project_id', title: 'project', obj: Project.getRetrievals().all},
                {name: 'role'}
            ],
            // Retrieve only users for a project
            users: [
                {name: 'user', title: 'user', obj: User.getRetrievals().guest},
                {name: 'role'}
            ]
        }
    }
});

module.exports = {
    ProjectPermission: Bookshelf.model('ProjectPermission', ProjectPermission)
};