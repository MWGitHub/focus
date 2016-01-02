"use strict";
var API = require('../lib/api');
var User = require('../models/user');
var List = require('../models/list');
var Boom = require('boom');
var co = require('co');
var Bookshelf = require('../lib/database').bookshelf;

var handler = {
    create: function(request, reply) {
        let title = request.payload.title;
        let boardID = request.params.board_id;
        let projectID = request.params.project_id;

        co(function* () {
            // Check to make sure the board is in the project
            var board = yield Bookshelf.model('Board').forge({id: boardID}).fetch();
            if (board.get('project_id') !== projectID) {
                throw Boom.badRequest();
            }

            var list = yield List.forge({title: title, board_id: boardID}).save();
            var data = yield list.retrieve(List.getRetrievals().all);
            reply(API.makeData(data));
        }).catch(function(e) {
            reply(Boom.wrap(e));
        });
    },

    update: function(request, reply) {

    },

    retrieve: function(request, reply) {
        var listId = request.params['id'];
        var boardID = request.params.board_id;
        var isDeep = !!request.query['isDeep'];
        co(function* () {
            try {
                var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
                var list = yield List.forge({id: listId}).fetch({require: true});
            } catch(e) {
                throw Boom.notFound();
            }
            if (list.get('user_id') !== user.get('id')) {
                throw Boom.unauthorized();
            }
            var data = yield list.retrieveAsData(isDeep);
            reply(API.makeData(data));
        }).catch(function(err) {
            reply(Boom.wrap(err));
        });
    },

    deleteSelf: function(request, reply) {
        var listId = request.params['id'];
        co(function* () {
            var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
            var list = yield List.forge({id: listId}).fetch({require: true});
            if (list.get('user_id') !== user.get('id')) {
                throw Boom.unauthorized();
            }
            yield list.destroyDeep();
            reply(API.makeStatusMessage('list-delete', true, 'list deleted'));
        }).catch(function(err) {
            reply(Boom.wrap(err));
        });

    }
};

module.exports = handler;