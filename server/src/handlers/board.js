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
        let title = request.payload.title;
        let bid = request.params.id;

        co(function* () {
            var board = yield Board.forge({id: bid}).fetch({require: true});
            var options = {};
            if (title !== board.get('title')) {
                options.title = title;
            }
            yield board.set(options).save();
            var result = yield board.retrieve(Board.getRetrievals().all);
            reply(API.makeData(result));
        }).catch(function(e) {
            reply(Boom.wrap(e));
        })
    },

    retrieve: function(request, reply) {
        var boardID = request.params['id'];
        var projectID = request.params['project_id'];

        return co(function* () {
            var board = yield Board.forge({id: boardID, project_id: projectID}).fetch({require: true});
            // Do not allow guests to view private boards
            if (!request.auth.isAuthenticated) {
                var project = yield board.project().fetch();
                if (!project.get('is_public')) {
                    throw Boom.unauthorized();
                }
            }
            var data = yield board.retrieve(Board.getRetrievals().all);
            reply(API.makeData(data));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    },

    deleteSelf: function(request, reply) {
        var id = request.params['id'];
        var projectID = request.params['project_id'];
        return co(function* () {
            var board = yield Board.forge({id: id, project_id: projectID}).fetch({require: true});
            yield board.destroy();
            reply(API.makeStatusMessage('board-delete', true, 'board deleted'));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    }
};

module.exports = handler;