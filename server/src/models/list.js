var Bookshelf = require('../lib/bookshelf');
var Task = require('./task');
var Board = require('./board');
var User = require('./user');
var co = require('co');

var List = Bookshelf.Model.extend({
    tableName: 'lists',
    hasTimestamps: ['created_at', 'updated_at'],

    tasks: function() {
        "use strict";
        return this.hasMany(Task);
    },

    board: function() {
        "use strict";
        return this.belongsTo(Board);
    },

    user: function() {
        "use strict";
        return this.belongsTo(User);
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    destroyDeep: function() {
        "use strict";

        var instance = this;
        return Task.where({list_id: instance.get('id')}).fetchAll()
            .then(function(collection) {
                return collection.invokeThen('destroy').then();
            })
            .then(function() {
                return instance.destroy();
            });
    },

    /**
     * Retrieves the list and properties as data.
     * @param {Boolean?} isDeep true to retrieve children.
     * @return {Promise} the promise for retrieval with the tasks.
     */
    retrieveAsData: function(isDeep) {
        "use strict";

        var instance = this;
        return co(function* () {
            if (!isDeep) {
                return {
                    type: 'lists',
                    id: this.get('id'),
                    attributes: {
                        board_id: this.get('board_id'),
                        user_id: this.get('user_id'),
                        title: this.get('title')
                    }
                };
            } else {
                var tasks = yield Task.where({list_id: instance.get('id')}).fetchAll();
                var data = {
                    type: 'lists',
                    id: instance.get('id'),
                    attributes: {
                        board_id: instance.get('board_id'),
                        user_id: instance.get('user_id'),
                        title: instance.get('title'),
                        tasks: []
                    }
                };
                for (var i = 0; i < tasks.length; i++) {
                    var task = tasks.models[i];
                    var taskData = yield task.retrieveAsData();
                    data.attributes.tasks.push(taskData);
                }
                return data;
            }
        });
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        title: {type: 'string', length: 150, notNullable: true},
        board_id: {type: 'integer', notNullable: true},
        user_id: {type: 'integer', notNullable: true}
    }
});

module.exports = List;