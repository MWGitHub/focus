var Bookshelf = require('../lib/bookshelf');
var Board = require('./board');
var Task = require('./task');
var List = require('./list');
var co = require('co');

var User = Bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: ['created_at', 'updated_at'],

    boards: function() {
        "use strict";
        return this.hasMany(Board, 'user_id');
    },

    tasks: function() {
        "use strict";
        return this.hasMany(Task, 'user_id');
    },

    lists: function() {
        "use strict";
        return this.hasMany(List, 'user_id');
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    destroyDeep: function() {
        "use strict";

        var instance = this;

        return co(function* () {
            var boards = yield Board.where({user_id: instance.get('id')}).fetchAll();
            yield boards.invokeThen('destroyDeep');
            return yield instance.destroy();
        });
    },

    /**
     * Retrieves the data of the board.
     * @param {Boolean?} isDeep true to retrieve all children data.
     * @return {Promise} the promise with the data.
     */
    retrieveAsData: function(isDeep) {
        "use strict";

        var instance = this;
        return co(function* () {
            var boards;
            if (!isDeep) {
                boards = yield instance.boards().fetch({
                    columns
                });
                console.log(boards);
                return {
                    type: 'users',
                    id: instance.get('id'),
                    attributes: {
                        username: instance.get('username'),
                        timezone: instance.get('timezone')
                    }
                };
            } else {
                boards = yield instance.boards().fetch();
                var data = {
                    type: 'users',
                    id: instance.get('id'),
                    attributes: {
                        username: instance.get('username'),
                        timezone: instance.get('timezone'),
                        boards: []
                    }
                };
                for (var i = 0; i < boards.length; i++) {
                    var board = boards.models[i];
                    var boardData = yield board.retrieveAsData(isDeep);
                    data.attributes.boards.push(boardData);
                }
                return data;
            }
        });
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        username: {type: 'string', length: 30, notNullable: true, unique: true},
        password: {type: 'string', length: 60, notNullable: true},
        // Time zone is used to determine when midnight is for the user
        timezone: {type: 'string', length: 150, notNullable: true},
        // format 'YYYY-MM-DD HH:mm:ss.SSSZZ'
        lastupdate: {type: 'datetime'}
    }
});

module.exports = User;