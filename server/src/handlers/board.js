"use strict";
var Board = require('../models/board');
var API = require('../lib/api');
var Boom = require('boom');
var co = require('co');

var handler = {
    create: function(request, reply) {
        let title = request.payload.title;
        let projectID = request.params.project_id;

        co(function* () {
            var board = yield Board.forge({title: title, project_id: projectID}).save();
            var data = yield board.retrieve(Board.getRetrievals().all);
            reply(API.makeData(data));
        }).catch(function(e) {
            reply(Boom.wrap(e));
        });
    },

    update: function(request, reply) {

    },

    retrieve: function(request, reply) {
        "use strict";

        var boardID = request.params['id'];
        var isDeep = !!request.query['isDeep'];
        return co(function* () {
            var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
            var userId = user.get('id');
            var board = yield Board.forge({id: boardID}).fetch({require: true});
            if (board.get('user_id') !== userId) {
                throw Boom.unauthorized();
            }
            var data = yield board.retrieveAsData(isDeep);
            reply(API.makeData(data));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
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
            reply(API.makeStatusMessage('board-delete', true, 'board deleted'));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });

    }
};

module.exports = handler;