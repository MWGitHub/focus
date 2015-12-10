"use strict";

var Project = require('../models/project');
var API = require('../lib/api');
var Boom = require('boom');
var co = require('co');
var Permission = require('../auth/permission-model');

/**
 * Columns to retrieve.
 */
var retrievals = {
    all: [
        {name: 'title'},
        {name: 'is_public'}
    ]
};

var handler = {
    create: function(request, reply) {
        var title = request.payload['title'];
        var isPublic = request.payload['is_public'] ? request.payload['is_public'] : false;
        var id = request.auth.credentials.id;

        return co(function* () {
            // Create the project
            var project = yield Project.forge({
                title: title,
                is_public: isPublic
            }).save();

            // Set the creator as the admin of the project
            var permission = yield Permission.ProjectPermission.forge({
                project_id: project.id,
                user_id: id,
                role: Permission.ProjectPermission.roles.admin
            }).save();

            var output = project.retrieve(retrievals.all);
            reply(API.makeData(output));
        }).catch(function(e) {
            console.log(e);
            reply(Boom.wrap(e));
        });
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