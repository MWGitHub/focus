var Project = require('../models/project');
var API = require('../lib/api');
var User = require('../models/user');
var Boom = require('boom');
var co = require('co');

var handler = {
    create: function(request, reply) {
        "use strict";
    },

    deleteSelf: function(request, reply) {
        "use strict";

        var projectID = request.params['id'];
        return co(function* () {
            var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
            var userId = user.get('id');
            var project = yield Project.forge({id: projectID}).fetch({require: true});
            if (project.get('user_id') !== userId) {
                reply(Boom.unauthorized());
                return;
            }
            yield project.destroyDeep();
            reply(API.makeStatusMessage('project-delete', true, 'project deleted'));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });

    },

    retrieve: function(request, reply) {
        "use strict";

        var projectID = request.params['id'];
        var isDeep = !!request.query['isDeep'];
        console.log(projectID);
        return co(function* () {
            var user = yield User.forge({id: request.auth.credentials.id}).fetch({require: true});
            var userId = user.get('id');
            var project = yield Project.forge({id: projectID}).fetch({require: true});
            if (project.get('user_id') !== userId) {
                throw Boom.unauthorized();
            }
            var data = yield project.retrieveAsData(isDeep);
            reply(API.makeData(data));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    }
};

module.exports = handler;