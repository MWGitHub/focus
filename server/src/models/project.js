"use strict";

var Bookshelf = require('../lib/database').bookshelf;
var co = require('co');
var _ = require('lodash');
var ModelUtil = require('../lib/model-util');
require('./board');
require('../permission/permission-model');

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
            yield permissions.invokeThen('destroy');

            // Destroy all connected boards
            var boards = yield instance.boards().fetch();
            yield boards.invokeThen('destroy');
        });
    },

    /**
     * Retrieves the data of the project.
     * @param {{name: string, obj: *}[]?} columns the columns to retrieve or all if none specified.
     * @return {Promise} the promise with the data.
     */
    retrieve: function(columns) {
        return ModelUtil.retrieve(this.tableName, this.get('id'), this, columns);
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        title: {type: 'string', length: 150, notNullable: true},
        is_public: {type: 'boolean', notNullable: true}
    },

    /**
     * Common columns to retrieve.
     * @returns {{all: *[]}}
     */
    getRetrievals: function() {
        return {
            all: [
                {name: 'title'},
                {name: 'is_public'}
            ],
            allDeep: [
                {name: 'title'},
                {name: 'is_public'},
                {name: 'boards', obj: Bookshelf.model('Board').getRetrievals().allDeep}
            ]
        };
    }
});

module.exports = Bookshelf.model('Project', Project);