var co = require('co');
var knex = require('../lib/database').knex;
var Logger = require('../lib/logger');
var _ = require('lodash');
var assert = require('assert');

var internals = {
    levels: ['admin', 'member', 'viewer'],
    types: {}
};

/**
 * Retrieve the user's scope for the given request.
 * @param {number} uid the id of the user to check the scope for.
 * @param request the request.
 * @returns {Promise.<string[]>}
 */
internals.getScope = function(uid, request) {
    return co(function* () {
        var options = request.route.settings.plugins.permission;
        // ID of the object being checked
        var id = request.params.id;
        // Use the type to retrieve the project id if needed
        var type = options ? options.type : request.params.type;

        // Invalid type, return empty scopes
        if (!internals.types[type]) {
            return [];
        }

        // console.log('uid: ' + uid + '   id: ' + id + '      type: ' + type);
        var permissionTable = null;
        var publicField = null;
        var table = null;
        // Find the base permissions of the type
        if (internals.types[type].permissionTable) {
            permissionTable = internals.types[type].permissionTable;
            publicField = internals.types[type].publicField;
            if (publicField) {
                table = internals.types[type].table;
            }
        } else {

        }

        var role = yield knex(permissionTable).where({
            user_id: uid,
            project_id: id
        }).select('role');

        if (role.length > 0) {
            return [role[0].role];
        } else {
            // If the model is not able to be public return no roles
            if (!publicField && table) {
                return [];
            }
            // Check if model is public if no other roles exist for user
            var isPublic = false;
            if (type === 'projects') {
                var model = yield knex(table).where({
                    id: id
                }).select(publicField);
                if (model.length > 0) {
                    isPublic = model[0][publicField];
                }
            }
            // Give the viewer role when public
            if (isPublic) {
                return ['viewer'];
            } else {
                // No role if project not found or not public
                return [];
            }
        }
    }).catch(function(e) {
        Logger.warn({uid: uid, object_id: request.params.id}, 'Error retrieving role');
        return [];
    })
};

var permission = {
    register: function(server, options, next) {
        assert(options, 'options are required');
        assert(options.types, 'at least one type is required');
        internals.types = _.cloneDeep(options.types);

        // Add the routes
        server.route(require('./permission-route'));

        // Add permissions to auth if given
        if (options.auth && options.auth.plugin && options.auth.method) {
            server.plugins[options.auth.plugin][options.auth.method].call(this, internals.getScope);
        }

        next();
    },

    /**
     * Levels of permissions.
     * @returns {Array}
     */
    levels: function() {
        return internals.levels;
    },

    /**
     * Types of permissions.
     */
    types: function() {
        return _.keys(internals.types);
    }
};
permission.register.attributes = {
    name: 'permission',
    version: '0.1.0'
};

module.exports = permission;