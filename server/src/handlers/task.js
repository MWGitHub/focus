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
        User.forge({username: request.auth.credentials.username}).fetch()
            .then(function(user) {
                if (!user) {
                    reply(Boom.notFound());
                } else {
                    var uid = user.get('id');
                    List.forge({id: list_id}).fetch().then(function(list) {
                        if (!list) {
                            reply(Boom.notFound());
                        } else {
                            if (list.get('user_id') !== uid) {
                                reply(Boom.unauthorized('Owner does not match user'));
                            } else {
                                Task.forge({
                                    list_id: list.get('id'),
                                    user_id: uid,
                                    title: title,
                                    duration: 0,
                                    age: 0,
                                    position: position
                                }).save().then(function() {
                                    reply(API.makeStatusMessage('task-create', true, 'Task created'));
                                });
                            }
                        }
                    });
                }
            })
    },

    updatePosition: function(request, reply) {
        "use strict";

        var id = request.payload['id'];
        var position = request.payload['position'];
        User.forge({username: request.auth.credentials.username}).fetch()
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
                                    if (task.get('position') === position) {
                                        reply(API.makeStatusMessage('task-update-position', true, 'Position unchanged'));
                                    } else {
                                        task.set('position', position).save().then(function () {
                                            reply(API.makeStatusMessage('task-update-position', true, 'Position updated'));
                                        })
                                    }
                                }
                            }
                        });
                }
            });
    },

    updateTitle: function(request, reply) {
        "use strict";

        var id = request.payload['id'];
        var title = Hoek.escapeHtml(request.payload['title']);
        User.forge({username: request.auth.credentials.username}).fetch()
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
        User.forge({username: request.auth.credentials.username}).fetch()
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