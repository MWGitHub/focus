"use strict";
var API = require('../lib/api');
var User = require('../models/user');
var List = require('../models/list');
var Boom = require('boom');
var Hoek = require('hoek');
var co = require('co');
var Bookshelf = require('../lib/database').bookshelf;

var handler = {
    create: function(request, reply) {
        let title = Hoek.escapeHtml(request.payload.title);
        let boardID = request.params.board_id;

        co(function* () {
            var list = yield List.forge({title: title, board_id: boardID}).save();
            var data = yield list.retrieve(List.getRetrievals().all);
            reply(API.makeData(data));
        }).catch(function(e) {
            reply(Boom.wrap(e));
        });
    },

    update: function(request, reply) {
        let title = request.payload.title;
        let id = request.params.id;

        co(function* () {
            var list = yield List.forge({id: id}).fetch({require: true});
            var options = {};
            if (title !== list.get('title')) {
                options.title = Hoek.escapeHtml(title);
            }
            yield list.set(options).save();
            var result = yield list.retrieve(List.getRetrievals().all);
            reply(API.makeData(result));
        }).catch(function(e) {
            reply(Boom.wrap(e));
        })
    },

    retrieve: function(request, reply) {
        var id = request.params.id;
        var bid = request.params.board_id;
        var pid = request.params.project_id;

        return co(function* () {
            var list = yield List.forge({id: id, board_id: bid}).fetch({require: true});

            // Make sure the list is owned by the board
            if (list.get('board_id') !== bid) {
                throw Boom.badRequest();
            }
            // Make sure the board matches the project
            let board = yield Bookshelf.model('Board').forge({id: bid}).fetch({require: true});
            if (board.get('project_id') !== pid) {
                throw Boom.badRequest();
            }

            // Do not allow guests to view private boards
            if (!request.auth.isAuthenticated) {
                var project = yield board.project().fetch();
                if (!project.get('is_public')) {
                    throw Boom.unauthorized();
                }
            }
            var data = yield list.retrieve(List.getRetrievals().all);
            reply(API.makeData(data));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    },

    deleteSelf: function(request, reply) {
        var id = request.params.id;
        var bid = request.params.board_id;
        return co(function* () {
            var list = yield List.forge({id: id, board_id: bid}).fetch({require: true});
            yield list.destroy();
            reply(API.makeStatusMessage('list-delete', true, 'list deleted'));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    }
};

module.exports = handler;