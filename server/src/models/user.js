var Bookshelf = require('../lib/bookshelf');
var Board = require('./board');
var Task = require('./task');
var List = require('./list');
var Project = require('./project');
var co = require('co');
var _ = require('lodash');

var User = Bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: ['created_at', 'updated_at'],

    projects: function() {
        return this.hasMany(Project, 'user_id');
    },

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

    standaloneBoards: function() {
        return this.boards().query('where', {project_id: null});
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
            var boards = yield instance.standaloneBoards().fetch();
            var projects = yield instance.projects().fetch();
            if (!isDeep) {
                var bids = _.map(boards.models, function(n) {
                    return n.id;
                });
                var pids = _.map(projects.models, function(n) {
                    return n.id;
                });
                return {
                    type: 'users',
                    id: instance.get('id'),
                    attributes: {
                        username: instance.get('username'),
                        timezone: instance.get('timezone'),
                        boards: bids,
                        projects: pids
                    }
                };
            } else {
                var data = {
                    type: 'users',
                    id: instance.get('id'),
                    attributes: {
                        username: instance.get('username'),
                        timezone: instance.get('timezone'),
                        boards: [],
                        projects: []
                    }
                };
                var i;
                for (i = 0; i < boards.length; i++) {
                    var board = boards.models[i];
                    var boardData = yield board.retrieveAsData(isDeep);
                    data.attributes.boards.push(boardData);
                }
                for (i = 0; i < projects.length; i++) {
                    var project = projects.models[i];
                    var projectData = yield project.retrieveAsData(isDeep);
                    data.attributes.projects.push(projectData);
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