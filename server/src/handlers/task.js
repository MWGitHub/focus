"use strict";
var Task = require('../models/task');
var Hoek = require('hoek');
var Boom = require('boom');
require('../models/list');
require('../models/board');
require('../models/project');
require('../permission/permission-model');
var Bookshelf = require('../lib/database').bookshelf;
var API = require('../lib/api');
var co = require('co');

var handler = {
    /**
     * Create a new task.
     */
    create: function(request, reply) {
        var list_id = request.params.list_id;
        var title = Hoek.escapeHtml(request.payload['title']);

        co(function* () {
            var data = {
                list_id: list_id,
                title: title
            };
            var task = yield Task.forge(data).save();
            var taskData = yield task.retrieve(Task.getRetrievals().all);

            reply(API.makeData(taskData));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    },

    update: function(request, reply) {
        let id = request.params.id;
        let changedID = request.payload.list_id;
        let title = request.payload.title ? Hoek.escapeHtml(request.payload.title) : null;

        co(function* () {
            let data = {};
            if (title) {
                data.title = title;
            }

            // Check if changed list is within user's permissions
            if (changedID) {
                let uid = request.auth.credentials.id;
                let list = yield Bookshelf.model('List').forge({id: changedID}).fetch({require: true});
                let board = yield list.board().fetch({require: true});
                let permission = yield Bookshelf.model('ProjectPermission').forge(
                    {
                        project_id: board.get('project_id'),
                        user_id: uid
                    }
                ).fetch({require: true});
                let role = permission.get('role');
                if (role === 'admin' || role === 'member') {
                    data.list_id = changedID;
                } else {
                    throw Boom.forbidden();
                }
            }
            let task = yield Task.forge({id: id}).fetch({require: true});
            task = yield task.set(data).save();
            var taskData = yield task.retrieve(Task.getRetrievals().all);

            reply(API.makeData(taskData));
        }).catch(function() {
            reply(Boom.forbidden());
        });
    },

    retrieve: function(request, reply) {
        var id = request.params.id;
        var lid = request.params.list_id;
        var bid = request.params.board_id;
        var pid = request.params.project_id;

        return co(function* () {
            let task = yield Task.forge({id: id, list_id: lid}).fetch();
            if (!task) {
                if (request.auth.isAuthenticated) {
                    throw Boom.forbidden();
                } else {
                    throw Boom.unauthorized();
                }
            }

            // Do not allow guests to view private boards
            if (!request.auth.isAuthenticated) {
                // Retrieve step by step to make sure the hierarchy is valid
                let list = yield Bookshelf.model('List').forge({id: lid, board_id: bid}).fetch();
                if (!list) throw Boom.unauthorized();
                let board = yield Bookshelf.model('Board').forge({id: bid, project_id: pid}).fetch();
                if (!board) throw Boom.unauthorized();
                let project = yield Bookshelf.model('Project').forge({id: pid}).fetch();
                if (!project) throw Boom.unauthorized();
                if (!project.get('is_public')) {
                    throw Boom.unauthorized();
                }
            }

            var data = yield task.retrieve(Task.getRetrievals().all);
            reply(API.makeData(data));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    },

    deleteSelf: function(request, reply) {
        "use strict";

        var id = request.params['id'];
        co(function* () {
            try {
                var user = yield User.forge({id: request.auth.credentials.id}).fetch({required: true});
                var task = yield Task.forge({id: id}).fetch({required: true})
            } catch(e) {
                throw Boom.notFound();
            }
            if (user.get('id') !== task.get('user_id')) {
                throw Boom.unauthorized();
            }
            // Update board staleness
            var list = yield List.forge({id: task.get('list_id')}).fetch({required: true});
            yield stale.touch(list.get('board_id'));

            yield task.destroy();
            reply(API.makeStatusMessage('task-delete', true, 'Task deleted'));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    }
};

module.exports = handler;