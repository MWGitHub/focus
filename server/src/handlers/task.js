var Task = require('../models/task');
var Hoek = require('hoek');
var User = require('../models/user');
var Boom = require('boom');
var List = require('../models/list');
var API = require('../lib/api');

var handler = {
    create: function(request, reply) {
        "use strict";

        var list_id = request.payload['list_id'];
        var title = Hoek.escapeHtml(request.payload['title']);
        var position = request.payload['position'];
        var extra = request.payload['extra'];
        var uid;
        User.forge({id: request.auth.credentials.id}).fetch({require: true})
            .then(function(user) {
                uid = user.get('id');
            })
            .then(function() {
                return List.forge({id: list_id, user_id: uid}).fetch({require: true})
            })
            .then(function(list) {
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
                return Task.forge(data).save();
            })
            .then(function(task) {
                reply(API.makeStatusMessage('task-create', true, 'Task created'));
            })
            .catch(function(err) {
                reply(Boom.unauthorized());
            });
    },

    updatePosition: function(request, reply) {
        "use strict";

        var listId = request.payload['list_id'];
        var id = request.payload['id'];
        var position = request.payload['position'];
        var title;
        if (request.payload['title']) {
            title = Hoek.escapeHtml(request.payload['title']);
        }
        var uid = null;
        User.forge({id: request.auth.credentials.id}).fetch({require: true})
            .then(function(user) {
                uid = user.get('id');
                if (listId) {
                    return List.forge({id: listId}).fetch({require: true})
                }
            })
            .then(function(list) {
                if (list) {
                    if (list.get('user_id') !== uid) {
                        console.log('not owner');
                        throw Boom.unauthorized();
                    }
                }
            })
            .then(function() {
                return Task.forge({id: id}).fetch({require: true});
            })
            .then(function (task) {
                if (task.get('user_id') !== uid) {
                    throw Boom.unauthorized();
                } else {
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
                    task.set(data).save().then(function () {
                        reply(API.makeData(task.retrieveAsData()));
                    })
                }
            })
            .catch(function(err) {
                reply(Boom.wrap(err));
            });
    },

    deleteSelf: function(request, reply) {
        "use strict";

        var id = request.params['id'];
        var uid;
        User.forge({id: request.auth.credentials.id}).fetch({required: true})
            .then(function(user) {
                uid = user.get('id');
                return Task.forge({id: id}).fetch({required: true})
            })
            .then(function(task) {
                if (task.get('user_id') !== uid) {
                    reply(Boom.unauthorized('Owner does not match user'));
                } else {
                    return task.destroy().then(function () {
                        reply(API.makeStatusMessage('task-delete', true, 'Task deleted'));
                    })
                }
            })
            .catch(function(e) {
                reply(Boom.notFound());
            });
    }
};

module.exports = handler;