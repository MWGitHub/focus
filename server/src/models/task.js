/**
 * Represents a task.
 */
var Bookshelf = require('../lib/database').bookshelf;
var List = require('./list');

var Task = Bookshelf.Model.extend({
    tableName: 'tasks',
    hasTimestamps: ['created_at', 'updated_at'],

    list: function() {
        "use strict";
        return this.belongsTo(List);
    },

    /**
     * Retrieves the task as data.
     * @return {Promise} the promise with the data.
     */
    retrieveAsData: function() {
        "use strict";

        console.log(this);

        return Promise.resolve({
            type: 'tasks',
            id: this.get('id'),
            attributes: {
                list_id: this.get('list_id'),
                title: this.get('title'),
                started_at: this.get('started_at'),
                completed_at: this.get('completed_at'),
                position: parseFloat(this.get('position')),
                data: this.get('data')
            }
        });
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
    }
});

module.exports = Task;