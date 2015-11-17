var Bookshelf = require('../lib/bookshelf');
var co = require('co');
var Board = require('./board');
var Permission = require('../auth/permission-model');
var _ = require('lodash');

var Project = Bookshelf.Model.extend({
    tableName: 'projects',
    hasTimestamps: ['created_at', 'updated_at'],

    boards: function() {
        return this.hasMany(Board);
    },

    permissions: function() {
        return this.hasMany(Permission.ProjectPermission);
    },

    /**
     * Destroys all related objects before destroying itself.
     * @return {Promise} the promise for destroying.
     */
    destroyDeep: function() {
        "use strict";

        var instance = this;

        return co(function* () {
            var boards = yield Board.where({project_id: instance.get('id')}).fetchAll();
            yield boards.invokeThen('destroyDeep');
            return yield instance.destroy();
        });
    },

    /**
     * Retrieves the data of the project.
     * @param {Boolean?} isDeep true to retrieve all children data.
     * @return {Promise} the promise with the data.
     */
    retrieveAsData: function(isDeep) {
        "use strict";

        var instance = this;
        return co(function* () {
            var boards = yield instance.boards().fetch();
            if (!isDeep) {
                var bids = _.map(boards.models, function(n) {
                    return n.id;
                });
                return {
                    type: 'projects',
                    id: instance.get('id'),
                    attributes: {
                        title: instance.get('title'),
                        owner: instance.get('owner'),
                        boards: bids
                    }
                };
            } else {
                var data = {
                    type: 'projects',
                    id: instance.get('id'),
                    attributes: {
                        title: instance.get('title'),
                        owner: instance.get('owner'),
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
        }, function(e) {
            console.log(e);
        });
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        title: {type: 'string', length: 150, notNullable: true},
        is_public: {type: 'boolean', notNullable: true}
    }
});

module.exports = Project;