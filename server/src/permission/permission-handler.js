var ProjectPermission = require('./permission-model').ProjectPermission;
var API = require('../lib/api');
var Boom = require('boom');
var co = require('co');
var User = require('../models/user');
var Project = require('../models/project');

var handler = {
    create: function(request, reply) {
        var uid = request.payload.user_id;
        var object_id = request.params.id;
        var role = request.payload.role;

        return co(function* () {
            // Make sure the user and project exists
            var user = yield User.forge({id: uid}).fetch({require: true});
            var project = yield Project.forge({id: object_id}).fetch({require: true});

            // Make sure the permission does not already exist
            var permission = yield ProjectPermission.forge({user_id: uid, project_id: object_id}).fetch();
            if (permission) {
                throw Boom.badRequest('User already has a role in the project');
            }

            // Create the permission
            yield ProjectPermission.forge({
                user_id: uid,
                project_id: object_id,
                role: role
            }).save();

            reply(API.makeStatusMessage('project-permission-create', true, 'Permission created for the project'));
        }).catch(function(e) {
            reply(Boom.wrap(e));
        });
    },

    retrieve: function(request, reply) {
        console.log(ProjectPermission.getRetrievals());
    },

    deleteSelf: function(request, reply) {

    }
};

module.exports = handler;