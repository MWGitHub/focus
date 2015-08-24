var Board = require('../models/board');
var API = require('../lib/api');
var User = require('../models/user');
var List = require('../models/list');
var Task = require('../models/task');
var Boom = require('boom');

var handler = {
    create: function(request, reply) {
        "use strict";

        /*
        User.forge({username: request.auth.credentials.username}).fetch()
            .then(function(user) {
                if (!user) {
                    reply(Boom.badImplementation('An error has occurred'));
                } else {
                    Board.forge({

                    }).save().then(function() {

                    });
                }
            });
        */
    },

    deleteSelf: function(request, reply) {
        "use strict";

    },

    retrieve: function(request, reply) {
        "use strict";

        var data = {};
        var board;
        var boardID = request.query['id'];
        User.forge({id: request.auth.credentials.id}).fetch({require: true})
            .then(function (user) {
                // Retrieve the board
                return Board.forge({id: boardID}).fetch({require: true});
            })
            .then(function (board) {
            })
    }

                    /*
                    var getTasks = function (boardID, tasks) {
                        return Task.where({list_id: boardID}).fetchAll()
                            .then(function(collection) {
                                for (var i = 0; i < collection.length; i++) {
                                    var task = collection.models[i];
                                    tasks.push({
                                        title: task.get('title'),
                                        duration: task.get('duration'),
                                        position: task.get('position')
                                    });
                                }
                            });
                    };

                    // Retrieve the board
                    Board.forge({user_id: user.get('id')}).fetch()
                        .then(function(model) {
                            board = model;
                            return List.where({board_id: board.get('id')}).fetchAll();
                        })
                        .then(function(collection) {
                            data.lists = [];
                            var promises = [];
                            var tasks = [];
                            for (var i = 0; i < collection.length; i++) {
                                console.log(collection.models[i].get('title'));
                                data.lists.push({
                                    title: collection.models[i].get('title'),
                                    tasks: tasks
                                });

                                promises.push(getTasks(collection.models[i].get('id'), tasks));
                            }
                            Promise.all(promises).then(function() {
                                reply(API.makeData(data));
                            });
                        });
                    */
};

module.exports = handler;