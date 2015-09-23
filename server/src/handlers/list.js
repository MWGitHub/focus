var API = require('../lib/api');
var User = require('../models/user');
var List = require('../models/list');
var Boom = require('boom');

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

        var listId = request.params['id'];
        var userId;
        User.forge({id: request.auth.credentials.id}).fetch({require: true})
            .then(function(user) {
                userId = user.get('id');
                return List.forge({id: listId}).fetch({require: true});
            })
            .then(function(list) {
                if (list.get('user_id') !== userId) {
                    throw Boom.unauthorized();
                }
                return list.destroyDeep().then();
            })
            .catch(function(err) {
                reply(Boom.wrap(err));
            });
    },

    retrieve: function(request, reply) {
        "use strict";

        var listId = request.params['id'];
        var userId;
        User.forge({id: request.auth.credentials.id}).fetch({require: true})
            .then(function (user) {
                userId = user.get('id');
                return List.forge({id: listId}).fetch({require: true});
            })
            .then(function(list) {
                if (list.get('user_id') !== userId) {
                    throw Boom.unauthorized();
                }
                return list.retrieveAsData();
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