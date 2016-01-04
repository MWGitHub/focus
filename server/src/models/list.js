"use strict";
var Bookshelf = require('../lib/database').bookshelf;
require('./task');
require('./board');
var co = require('co');
var ModelUtil = require('../lib/model-util');

var List = Bookshelf.Model.extend({
    tableName: 'lists',
    hasTimestamps: ['created_at', 'updated_at'],

    initialize: function() {
        this.on('destroying', this._destroyDeep, this);
    },

    tasks: function() {
        return this.hasMany('Task');
    },

    board: function() {
        return this.belongsTo('Board');
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    _destroyDeep: function() {
        var instance = this;
        return co(function* () {
            var lists = yield instance.tasks().fetch();
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
        board_id: {type: 'integer', notNullable: true}
    },

    /**
     * Common columns to retrieve.
     * @returns {{all: *[]}}
     */
    getRetrievals: function() {
        return {
            all: [
                {name: 'title'},
                {name: 'board_id'}
            ],
            allDeep: [
                {name: 'title'},
                {name: 'board_id'},
                {name: 'tasks', obj: Bookshelf.model('Task').getRetrievals().all}
            ]
        };
    }
});

module.exports = Bookshelf.model('List', List);