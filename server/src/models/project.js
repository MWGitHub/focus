"use strict";

var Bookshelf = require('../lib/database').bookshelf;
var co = require('co');
var Board = require('./board');
var Permission = require('../auth/permission-model');
var _ = require('lodash');

var Project = Bookshelf.Model.extend({
    tableName: 'projects',
    hasTimestamps: ['created_at', 'updated_at'],

    initialize: function() {
        this.on('destroying', this._destroyDeep, this);
    },

    boards: function() {
        return this.hasMany(Board);
    },

    permissions: function() {
        return this.hasMany(Permission.ProjectPermission);
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    _destroyDeep: function() {
        var instance = this;

        return co(function* () {
            // Destroy all permissions
            var permissions = yield instance.permissions().fetch();
            yield permissions.invokeThen('destroy');

            // Destroy all connected boards
            var boards = yield instance.boards().fetch();
            yield boards.invokeThen('destroy');

            // Destroy the itself
            return yield instance.destroy();
        });
    },

    /**
     * Retrieves the data of the project.
     * @param {{name: string, isDeep: boolean}[]?} columns the columns to retrieve or all if none specified.
     * @return {Promise} the promise with the data.
     */
    retrieve: function(columns) {
        var instance = this;
        return co(function* () {
            var output = {
                type: 'projects',
                id: instance.get('id'),
                attributes: {}
            };
            if (!columns) {
                output.attributes.title = instance.get('title');
                output.attributes.is_public = instance.get('is_public');
            } else {
                for (var i = 0; i < columns.length; i++) {
                    var column = columns[i];
                    if (instance.has(column.name)) {
                        output.attributes[column.name] = instance.get(column.name);
                    }
                }
            }
            return output;
        }, function(e) {
            console.log(e);
        });
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        title: {type: 'string', length: 150, notNullable: true},
        is_public: {type: 'boolean', notNullable: true}
    }
});

module.exports = Project;