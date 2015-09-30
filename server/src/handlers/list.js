var API = require('../lib/api');
var User = require('../models/user');
var List = require('../models/list');
var Boom = require('boom');
var co = require('co');

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

    },

    retrieve: function(request, reply) {
        "use strict";

        var listId = request.params['id'];
        co(function* () {
            var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
            var list = yield List.forge({id: listId}).fetch({require: true});
            if (list.get('user_id') !== user.get('id')) {
                throw Boom.unauthorized();
            }
            var data = yield list.retrieveAsData(true);
            reply(API.makeData(data));
        }).catch(function(err) {
            reply(Boom.wrap(err));
        });
    }
};

module.exports = handler;