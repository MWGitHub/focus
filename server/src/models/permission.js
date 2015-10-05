/**
 * Permission models for models that require them.
 */
var Bookshelf = require('../lib/bookshelf');

var BoardPermission = Bookshelf.Model.extend({
    tableName: 'board_permissions'
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        role: {type: 'string', notNullable: true},
        board_id: {type: 'integer', notNullable: true},
        user_id: {type: 'integer', notNullable: true}
    },
    /**
     * Roles give the following permissions:
     *  admin: delete/update board, CRUD lists, CRUD tasks
     *  member: CRUD lists, CRUD tasks
     *  viewer: read only permissions
     */
    roles: {
        admin: 'admin',
        member: 'member',
        viewer: 'viewer'
    }
});

var ProjectPermission = Bookshelf.Model.extend({
    tableName: 'project_permissions'
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
    BoardPermission: BoardPermission,
    ProjectPermission: ProjectPermission
};