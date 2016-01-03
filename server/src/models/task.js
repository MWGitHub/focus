"use strict";
/**
 * Represents a task.
 */
var Bookshelf = require('../lib/database').bookshelf;
var ModelUtil = require('../lib/model-util');
require('./list');

var Task = Bookshelf.Model.extend({
    tableName: 'tasks',
    hasTimestamps: ['created_at', 'updated_at'],

    list: function() {
        return this.belongsTo('List');
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
        // List the owns the task
        list_id: {type: 'integer', notNullable: true, references: 'lists.id'},
        // Title of the task
        title: {type: 'string', length: 150, notNullable: true},
        // Time the task was started at for calculating duration
        started_at: {type: 'datetime'},
        // Completed date
        completed_at: {type: 'datetime'},
        // Position or manual priority for the task
        position: {type: 'integer', notNullable: true},
        // Arbitrary data for a task that is only used client side
        data: {type: 'jsonb'}
    },

    /**
     * Common columns to retrieve.
     * @returns {{all: *[]}}
     */
    getRetrievals: function() {
        return {
            all: [
                {name: 'title'},
                {name: 'list_id'}
            ]
        };
    }
});

module.exports = Bookshelf.model('Task', Task);