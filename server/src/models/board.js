var Bookshelf = require('../lib/bookshelf');
var List = require('./list');
var User = require('./user');

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

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    destroyDeep: function() {
        "use strict";

        var instance = this;
        return List.where({board_id: instance.get('id')}).fetchAll()
            .then(function(collection) {
                return collection.invokeThen('destroyDeep').then();
            })
            .then(function() {
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

        if (!isDeep) {
            return Promise.resolve({
                type: 'boards',
                id: this.get('id'),
                attributes: {
                    user_id: this.get('user_id'),
                    title: this.get('title')
                }
            });
        } else {
            var instance = this;
            return List.where({board_id: instance.get('id')}).fetchAll()
                .then(function(collection) {
                    var data = {
                        type: 'boards',
                        id: instance.get('id'),
                        attributes: {
                            user_id: instance.get('user_id'),
                            title: instance.get('title'),
                            lists: []
                        }
                    };
                    var promises = [];
                    for (var i = 0; i < collection.length; i++) {
                        var list = collection.models[i];
                        promises.push(list.retrieveAsData(isDeep).then(function(listData) {
                            data.attributes.lists.push(listData);
                        }));
                    }
                    return Promise.all(promises).then(function() {
                        return data;
                    });
                });
        }
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        title: {type: 'string', length: 150, notNullable: true},
        user_id: {type: 'integer', notNullable: true}
    }
});

module.exports = Board;