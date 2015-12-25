"use strict";

var Project = require('../models/project');
var API = require('../lib/api');
var Boom = require('boom');
var co = require('co');
var Permission = require('../permission/permission-model');

var handler = {
    create: function(request, reply) {
        var title = request.payload['title'];
        var isPublic = !!request.payload['is_public'];
        var id = request.auth.credentials.id;

        return co(function* () {
            // Create the project
            var project = yield Project.forge({
                title: title,
                is_public: isPublic
            }).save();

            // Set the creator as the admin of the project
            yield Permission.ProjectPermission.forge({
                project_id: project.id,
                user_id: id,
                role: Permission.ProjectPermission.roles.admin
            }).save();

            var output = yield project.retrieve(Project.getRetrievals().all);
            reply(API.makeData(output));
        }).catch(function(e) {
            reply(Boom.wrap(e));
        });
    },

    update: function(request, reply) {
        var title = request.payload['title'];
        var isPublic = request.payload['is_public'];
        var pid = request.params.id;

        return co(function* () {
            var project = yield Project.forge({id: pid}).fetch({require: true});
            var options = {};
            if (title) {
                options.title = title;
            }
            if (isPublic != null) {
                options.is_public = isPublic
            }
            yield project.set(options).save();
            var result = yield project.retrieve(Project.getRetrievals().all);
            reply(API.makeData(result));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    },

    retrieve: function(request, reply) {
        var projectID = request.params['id'];
        var isDeep = request.query['isDeep'];

        return co(function* () {
            var project = yield Project.forge({id: projectID}).fetch({require: true});
            // Do not allow guests to view private projects
            if (!request.auth.isAuthenticated && !project.get('is_public')) {
                throw Boom.unauthorized();
            }
            var data = yield project.retrieve(Project.getRetrievals().all);
            reply(API.makeData(data));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });
    },

    deleteSelf: function(request, reply) {
        var projectID = request.params['id'];
        return co(function* () {
            var project = yield Project.forge({id: projectID}).fetch({require: true});
            yield project.destroy();
            reply(API.makeStatusMessage('project-delete', true, 'project deleted'));
        }).catch(function(error) {
            reply(Boom.wrap(error));
        });

    }
};

module.exports = handler;