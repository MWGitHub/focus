var co = require('co');
var knex = require('../lib/database').knex;
var Logger = require('../lib/logger');

var internals = {
    levels: ['admin', 'member', 'viewer']
};

var permission = {
    register: function(server, options, next) {
        next();
    },

    /**
     * Retrieve the user's scope for the given request.
     * @param {number} uid the id of the user to check the scope for.
     * @param request the request.
     * @returns {Promise.<string[]>}
     */
    getScope: function(uid, request) {
        return co(function* () {
            var options = request.route.settings.plugins.permission;
            // ID of the object being checked
            var id = request.params.id;
            // Use the type to retrieve the project id if needed
            var type = options ? options.type : request.params.type;

            // console.log('uid: ' + uid + '   id: ' + id + '      type: ' + type);
            var role = yield knex('project_permissions').where({
                user_id: uid,
                project_id: id
            }).select('role');

            if (role.length > 0) {
                return [role[0].role];
            } else {
                // Check if project is public if no other roles exist for user
                var isPublic = false;
                if (type === 'project') {
                    var project = yield knex('projects').where({
                        id: id
                    }).select('is_public');
                    if (project.length > 0) {
                        isPublic = project[0].is_public;
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
    },

    /**
     * Levels of permissions.
     * @returns {Array}
     */
    levels: function() {
        return internals.levels;
    }
};
permission.register.attributes = {
    name: 'permission',
    version: '0.1.0'
};

module.exports = permission;