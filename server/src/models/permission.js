/**
 * Permission models for models that require them.
 */
var Bookshelf = require('../lib/bookshelf');

var BoardPermission = Bookshelf.Model.extend({
    tableName: 'board_permissions'
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        role: {type: 'string', noNullable: true},
        board_id: {type: 'integer', notNullable: true},
        user_id: {type: 'integer', notNullable: true}
    }
});

var ProjectPermission = Bookshelf.Model.extend({
    tableName: 'project_permissions'
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        role: {type: 'string', noNullable: true},
        project_id: {type: 'integer', notNullable: true},
        user_id: {type: 'integer', notNullable: true}
    }
});

module.exports = {
    BoardPermission: BoardPermission,
    ProjectPermission: ProjectPermission
};