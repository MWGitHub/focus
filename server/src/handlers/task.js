var Task = require('../models/task');
var Hoek = require('hoek');
var User = require('../models/user');
var Boom = require('boom');
var List = require('../models/list');
var API = require('../lib/api');
var stale = require('../lib/stale');
var co = require('co');

var handler = {
    /**
     * Create a new task.
     */
    create: function(request, reply) {
        "use strict";

        var list_id = request.payload['list_id'];
        var title = Hoek.escapeHtml(request.payload['title']);
        var position = request.payload['position'];
        var extra = request.payload['extra'];

        co(function* () {
            var user = yield User.forge({id: request.auth.credentials.id}).fetch();
            if (!user) {
                reply(Boom.notFound());
                return;
            }
            var uid = user.get('id');

            var list = yield List.forge({id: list_id}).fetch();
            if (!list) {
                reply(Boom.notFound());
                return;
            }

            if (uid !== list.get('user_id')) {
                reply(Boom.unauthorized());
                return;
            }

            var data = {
                list_id: list.get('id'),
                user_id: uid,
                title: title,
                age: 0,
                position: position
            };
            if (extra) {
                data.extra = extra;
            }
            var task = yield Task.forge(data).save();
            var taskData = yield task.retrieveAsData();

            // Signal that the board has been updated
            yield stale.touch(list.get('board_id'));

            reply(API.makeData(taskData));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    },

    retrieve: function(request, reply) {
        "use strict";

        var id = request.params['id'];

        co(function* () {
            try {
                var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
                var task = yield Task.forge({id: id}).fetch({require: true});
            } catch(e) {
                throw Boom.notFound();
            }
            if (task.get('user_id') !== user.get('id')) {
                throw Boom.unauthorized();
            }
            var data = yield task.retrieveAsData();
            reply(API.makeData(data));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    },

    update: function(request, reply) {
        "use strict";

        var listId = request.payload['list_id'];
        var id = request.params['id'];
        var position = request.payload['position'];
        var title;
        if (request.payload['title']) {
            title = Hoek.escapeHtml(request.payload['title']);
        }

        co(function* () {
            var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
            var uid = user.get('id');
            var list = null;
            if (listId) {
                list = yield List.forge({id: listId}).fetch({require: true});
                if (list.get('user_id') !== uid) {
                    throw Boom.unauthorized();
                }
            }
            var task = yield Task.forge({id: id}).fetch({require: true});
            if (task.get('user_id') !== uid) {
                throw Boom.unauthorized();
            }
            var data = {};
            if (position) {
                data.position = position;
            }
            if (title) {
                data.title = title;
            }
            if (listId) {
                data.list_id = listId;
            }
            task = yield task.set(data).save();
            var taskData = yield task.retrieveAsData();

            // Update board staleness
            var bid;
            if (list) {
                bid = list.get('board_id');
            } else {
                list = yield List.forge({id: task.get('list_id')}).fetch({require: true});
                bid = list.get('board_id');
            }
            yield stale.touch(bid);

            reply(API.makeData(taskData));
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