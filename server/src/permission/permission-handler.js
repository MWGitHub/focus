"use strict";

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
        var id = request.params.id;

        return co(function* () {
            // Do not retrieve data for unauthenticated private objects
            if (!request.auth.isAuthenticated) {
                let project = yield Project.forge({id: id}).fetch({require: true});
                if (!project.get('is_public')) {
                    reply(Boom.unauthorized());
                    return;
                }
            }
            let permissions = (yield ProjectPermission.where('project_id', '=', id).fetchAll({require: true})).models;
            var data = [];
            for (let i = 0; i < permissions.length; i++) {
                let permission = permissions[i];
                data.push(yield permission.retrieve(ProjectPermission.getRetrievals().users));
            }
            reply(API.makeData(data));
        }).catch(function(e) {
            reply(Boom.wrap(e));
        });
    },

    update: function(request, reply) {
        var id = request.params.id;
        var role = request.payload.role;
        var userID = request.payload.user_id;

        return co(function* () {
            let permission = yield ProjectPermission.forge({project_id: id, user_id: userID}).fetch({require: true});
            // No change, do nothing
            if (role === permission.get('role')) {
                reply();
                return;
            }
            // Only admin for object, no change
            if (role !== 'admin') {
                let adminCount = yield ProjectPermission.where({
                    project_id: id,
                    role: ProjectPermission.roles.admin
                }).count();
                if (adminCount <= 1) {
                    reply(Boom.badRequest());
                    return;
                }
            }
            // Set to the new role
            yield permission.set({role: role}).save();
            reply();
        }).catch(function(e) {
            reply(Boom.wrap(e));
        });
    },

    deleteSelf: function(request, reply) {
        var id = request.params.id;
        var userID = request.payload.user_id;

        return co(function* () {
            let permission = yield ProjectPermission.forge({project_id: id, user_id: userID}).fetch({require: true});
            // Check if they are the only admin
            if (permission.get('role') === 'admin') {
                let adminCount = yield ProjectPermission.where({
                    project_id: id,
                    role: ProjectPermission.roles.admin
                }).count();
                if (adminCount <= 1) {
                    reply(Boom.badRequest());
                    return;
                }
            }
            // Not an admin, delete the role
            yield permission.destroy();
            reply();
        }).catch(function(e) {
            reply(Boom.wrap(e));
        });
    }
};

module.exports = handler;