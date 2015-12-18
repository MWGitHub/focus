"use strict";

var Bookshelf = require('../lib/database').bookshelf;
var co = require('co');
var _ = require('lodash');
require('./board');
require('../auth/permission-model');

var Project = Bookshelf.Model.extend({
    tableName: 'projects',
    hasTimestamps: ['created_at', 'updated_at'],

    initialize: function() {
        this.on('destroying', this._destroyDeep, this);
    },

    boards: function() {
        return this.hasMany('Board');
    },

    permissions: function() {
        return this.hasMany('ProjectPermission');
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    _destroyDeep: function(model, attrs, options) {
        var instance = this;

        return co(function* () {
            // Destroy all permissions
            var permissions = yield instance.permissions().fetch();
            console.log(permissions);
            yield permissions.invokeThen('destroy');
            console.log('permission destroyed');

            // Destroy all connected boards
            var boards = yield instance.boards().fetch();
            yield boards.invokeThen('destroy');
        }).catch(function(e) {
            console.log(e);
        });
    },

    /**
     * Retrieves the data of the project.
     * @param {{name: string, obj: *}[]?} columns the columns to retrieve or all if none specified.
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
                    // If the column is a relationship retrieve the relationship
                    if (column.obj != null) {
                        var items = [];
                        var children = yield instance[column.name].call(instance);
                        for (var j = 0; j < children.length; j++) {
                            var childData = yield children[j].retrieve(column.obj);
                            items.push(childData);
                        }
                        output.attributes[column.name] = items;
                    } else if (instance.has(column.name)) {
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
    },

    /**
     * Preset ways of retrieving properties.
     */
    retrievals: {
        all: [
            {name: 'title'},
            {name: 'is_public'}
        ]
    }
});

module.exports = Bookshelf.model('Project', Project);