var Bookshelf = require('../lib/bookshelf');
var List = require('./list');
var User = require('./user');
var Project = require('./project');
var Permission = require('../auth/permission-model');
var co = require('co');

var Board = Bookshelf.Model.extend({
    tableName: 'boards',
    hasTimestamps: ['created_at', 'updated_at'],

    lists: function() {
        "use strict";
        return this.hasMany(List);
    },

    user: function() {
        "use strict";
        return this.belongsTo(User);
    },

    project: function() {
        return this.belongsTo(Project);
    },

    permissions: function() {
        return this.hasMany(Permission);
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    destroyDeep: function() {
        "use strict";

        var instance = this;
        return co(function* () {
            var lists = yield List.where({board_id: instance.get('id')}).fetchAll();
            yield lists.invokeThen('destroyDeep');
            return instance.destroy();
        });
    },

    /**
     * Retrieves the data of the board.
     * @param {Boolean?} isDeep true to retrieve children.
     * @return {Promise} the promise with the data.
     */
    retrieveAsData: function(isDeep) {
        "use strict";

        var instance = this;
        return co(function* () {
            if (!isDeep) {
                return {
                    type: 'boards',
                    id: instance.get('id'),
                    attributes: {
                        user_id: instance.get('user_id'),
                        title: instance.get('title')
                    }
                };
            } else {
                var lists = yield List.where({board_id: instance.get('id')}).fetchAll();
                var data = {
                    type: 'boards',
                    id: instance.get('id'),
                    attributes: {
                        user_id: instance.get('user_id'),
                        title: instance.get('title'),
                        lists: []
                    }
                };
                for (var i = 0; i < lists.length; i++) {
                    var list = lists.models[i];
                    var listData = yield list.retrieveAsData(isDeep);
                    data.attributes.lists.push(listData);
                }
                return data;
            }
        });

    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        title: {type: 'string', length: 150, notNullable: true},
        user_id: {type: 'integer', notNullable: true},
        is_public: {type: 'boolean', notNullable: true}
    }
});

module.exports = Board;