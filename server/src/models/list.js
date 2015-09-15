var Bookshelf = require('../lib/bookshelf');
var Task = require('./task');
var Board = require('./board');
var User = require('./user');

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
     * @return {Promise} the promise for retrieval with the tasks.
     */
    retrieveAsData: function() {
        "use strict";

        var instance = this;
        return Task.where({list_id: instance.get('id')}).fetchAll()
            .then(function(collection) {
                var data = {
                    type: 'lists',
                    id: instance.get('id'),
                    timezone: instance.get('timezone'),
                    attributes: {
                        title: instance.get('title'),
                        tasks: []
                    }
                };
                for (var i = 0; i < collection.length; i++) {
                    var task = collection.models[i];
                    data.attributes.tasks.push(task.retrieveAsData());
                }
                return data;
            })
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