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
        var before = request.payload['before'];
        var after = request.payload['after'];
        var beforeTask, afterTask;
        var list;
        var uid;
        User.forge({id: request.auth.credentials.id}).fetch({require: true})
            .then(function(user) {
                uid = user.get('id');
            })
            .then(function() {
                return List.forge({id: list_id, user_id: uid}).fetch({require: true})
            })
            .then(function(vlist) {
                list = vlist;
            })
            .then(function() {
                return Task.forge({id: before, user_id: uid, list_id: list_id}).fetch();
            })
            .then(function(t) {
                beforeTask = t;
            })
            .then(function() {
                return Task.forge({id: after, user_id: uid, list_id: list_id}).fetch()
            })
            .then(function(t) {
                afterTask = t;
            })
            .then(function() {
                Task.forge({
                    list_id: list.get('id'),
                    user_id: uid,
                    title: title,
                    duration: 0,
                    age: 0,
                    before: beforeTask ? before : '',
                    after: afterTask ? after : ''
                }).save();
            })
            // On successful save update the other tasks before and after
            .then(function(task) {

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
        var uid = null;
        User.forge({id: request.auth.credentials.id}).fetch({require: true})
            .then(function(user) {
                uid = user.get('id');
                return List.forge({id: listId}).fetch({require: true});
            })
            .then(function(list) {
                if (list.get('user_id') !== uid) {
                    throw new Error('User does not match owner');
                } else {
                    return Task.forge({id: id}).fetch({require: true});
                }
            })
            .then(function (task) {
                if (task.get('user_id') !== uid) {
                    throw new Error('User does not match owner');
                } else {
                    if (task.get('position') === position && task.get('list_id') === listId) {
                        reply(API.makeStatusMessage('task-update-position', true, 'Position unchanged'));
                    } else {
                        task.set({
                            position: position,
                            list_id: listId
                        }).save().then(function () {
                            reply(API.makeStatusMessage('task-update-position', true, 'Position updated'));
                        })
                    }
                }
            })
            .catch(function(err) {
                reply(Boom.notFound());
            });
    },

    updateTitle: function(request, reply) {
        "use strict";

        var id = request.payload['id'];
        var title = Hoek.escapeHtml(request.payload['title']);
        User.forge({id: request.auth.credentials.id}).fetch()
            .then(function(user) {
                if (!user) {
                    reply(Boom.notFound());
                } else {
                    var uid = user.get('id');
                    Task.forge({id: id}).fetch()
                        .then(function(task) {
                            if (!task) {
                                reply(Boom.notFound());
                            } else {
                                if (task.get('user_id') !== uid) {
                                    reply(Boom.unauthorized('Owner does not match user'));
                                } else {
                                    if (task.get('title') === title) {
                                        reply(API.makeStatusMessage('task-update-title', true, 'Title unchanged'));
                                    } else {
                                        task.set('title', title).save().then(function () {
                                            reply(API.makeStatusMessage('task-update-title', true, 'Title updated'));
                                        })
                                    }
                                }
                            }
                        });
                }
            });
    },

    deleteSelf: function(request, reply) {
        "use strict";

        var id = request.payload['id'];
        User.forge({id: request.auth.credentials.id}).fetch()
            .then(function(user) {
                if (!user) {
                    reply(Boom.notFound());
                } else {
                    var uid = user.get('id');
                    Task.forge({id: id}).fetch()
                        .then(function(task) {
                            if (!task) {
                                reply(Boom.notFound());
                            } else {
                                if (task.get('user_id') !== uid) {
                                    reply(Boom.unauthorized('Owner does not match user'));
                                } else {
                                    task.destroy().then(function () {
                                        reply(API.makeStatusMessage('task-delete', true, 'Task deleted'));
                                    })
                                }
                            }
                        });
                }
            });
    }
};

module.exports = handler;