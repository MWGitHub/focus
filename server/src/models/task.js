/**
 * Represents a task.
 */
var Bookshelf = require('../lib/bookshelf');
var List = require('./list');
var User = require('./user');

var Task = Bookshelf.Model.extend({
    tableName: 'tasks',
    hasTimestamps: ['created_at', 'updated_at'],

    list: function() {
        "use strict";
        return this.belongsTo(List);
    },

    user: function() {
        "use strict";
        return this.belongsTo(User);
    },

    /**
     * Retrieves the task as data.
     * @return {Promise} the promise with the data.
     */
    retrieveAsData: function() {
        "use strict";

        return {
            type: 'tasks',
            id: this.get('id'),
            attributes: {
                title: this.get('title'),
                duration: this.get('duration'),
                started_at: this.get('started_at'),
                completed_at: this.get('completed_at'),
                age: this.get('age'),
                position: this.get('position')
            }
        }
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        list_id: {type: 'integer', notNullable: true, references: 'lists.id'},
        // User ID to keep track of who owns the task
        user_id: {type: 'integer', notNullable: true, references: 'user.id'},
        // Title of the task
        title: {type: 'string', length: 150, notNullable: true},
        // Time the task was started at for calculating duration
        started_at: {type: 'datetime'},
        // Completed date
        completed_at: {type: 'datetime'},
        // Age of the task, increments each time the task is not completed in today
        age: {type: 'integer', notNullable: true},
        // Tasks that are before and after this task.
        before: {type: 'integer', references: 'task.id'},
        after: {type: 'integer', references: 'task.id'}
    }
});

module.exports = Task;