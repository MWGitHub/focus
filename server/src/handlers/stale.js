var Boom = require('boom');
var API = require('../lib/api');
var Stale = require('../lib/stale');
var co = require('co');
var User = require('../models/user');
var redis = require('../lib/redis-client').client;

var staleHandler = {
    retrieveStaleness: function(request, reply) {
        co(function* () {
            // TODO: Decide if checking for authorization is needed
            var id = request.auth.credentials.id;
            var staleness = yield Stale.getStaleness(request.params['bid']);
            if (staleness) {
                reply(API.makeData({staleness: staleness}));
            } else {
                reply(Boom.notFound());
            }
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    }
};

module.exports = staleHandler;