var Board = require('../models/board');
var API = require('../lib/api');
var User = require('../models/user');
var Boom = require('boom');
var co = require('co');

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

        var boardID = request.params['id'];
        return co(function* () {
            var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
            var userId = user.get('id');
            var board = yield Board.forge({id: boardID}).fetch({require: true});
            if (board.get('user_id') !== userId) {
                reply(Boom.unauthorized());
                return;
            }
            yield board.destroyDeep();
            reply(API.makeStatusMessage('board-destroy', true, 'board destroyed'));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });

    },

    retrieve: function(request, reply) {
        "use strict";

        var boardID = request.params['id'];
        var userId;
        User.forge({id: request.auth.credentials.id}).fetch({require: true})
            .then(function (user) {
                userId = user.get('id');
                return Board.forge({id: boardID}).fetch({require: true});
            })
            .then(function(board) {
                if (board.get('user_id') !== userId) {
                    throw Boom.unauthorized();
                }
                return board.retrieveAsData(true);
            })
            .then(function(data) {
                reply(API.makeData(data));
            })
            .catch(function(err) {
                reply(Boom.wrap(err));
            });
    }
};

module.exports = handler;