var Bookshelf = require('../lib/bookshelf');
var co = require('co');
var User = require('./user');
var Board = require('./board');

var Project = Bookshelf.Model.extend({
    tableName: 'projects',
    hasTimestamps: ['created_at', 'updated_at'],

    user: function() {
        this.belongsTo(User);
    },

    boards: function() {
        this.hasMany(Board);
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        title: {type: 'string', length: 150, notNullable: true},
        user_id: {type: 'integer', notNullable: true}
    }
});

module.exports = Project;