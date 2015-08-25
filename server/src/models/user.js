var Bookshelf = require('../lib/bookshelf');
var Board = require('./board');
var Task = require('./task');
var List = require('./list');

var User = Bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: ['created_at', 'updated_at'],

    boards: function() {
        "use strict";
        return this.hasMany(Board);
    },

    tasks: function() {
        "use strict";
        return this.hasMany(Task);
    },

    lists: function() {
        "use strict";
        return this.hasMany(List);
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    destroyDeep: function() {
        "use strict";

        var instance = this;
        return Board.where({user_id: instance.get('id')}).fetchAll()
            .then(function(collection) {
                return collection.invokeThen('destroyDeep');
            })
            .then(function() {
                return instance.destroy();
            });
    },

    retrieveAsData: function() {
        "use strict";

        var instance = this;
        return Board.where({user_id: instance.get('id')}).fetchAll()
            .then(function(collection) {
                var data = {
                    type: 'users',
                    id: instance.get('id'),
                    attributes: {
                        username: instance.get('username'),
                        boards: []
                    }
                };
                var promises = [];
                for (var i = 0; i < collection.length; i++) {
                    var model = collection.models[i];
                    promises.push(model.retrieveAsData().then(function(boardData) {
                        data.attributes.boards.push(boardData);
                    }));
                }
                return Promise.all(promises).then(function() {
                    return data;
                });
            });
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        username: {type: 'string', length: 30, notNullable: true, unique: true},
        password: {type: 'string', length: 60, notNullable: true},
        timezone: {type: 'string', length: 150, notNullable: true},
        // format 'YYYY-MM-DD HH:mm:ss.SSSZZ'
        lastupdate: {type: 'datetime'}
    }
});

module.exports = User;