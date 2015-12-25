"use strict";
var Bookshelf = require('../lib/database').bookshelf;
var ModelUtil = require('../lib/model-util');
require('./list');
require('./project');
var co = require('co');

var Board = Bookshelf.Model.extend({
    tableName: 'boards',
    hasTimestamps: ['created_at', 'updated_at'],

    initialize: function() {
        this.on('destroying', this._destroyDeep, this);
    },

    lists: function() {
        return this.hasMany('List');
    },

    project: function() {
        return this.belongsTo('Project');
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    _destroyDeep: function() {
        var instance = this;
        return co(function* () {
            var lists = yield instance.lists().fetch();
            yield lists.invokeThen('destroy');
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
        project_id: {type: 'integer', notNullable: true}
    },

    /**
     * Common columns to retrieve.
     * @returns {{all: *[]}}
     */
    getRetrievals: function() {
        return {
            all: [
                {name: 'title'}
            ]
        };
    }
});

module.exports = Bookshelf.model('Board', Board);