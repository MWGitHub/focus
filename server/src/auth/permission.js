var co = require('co');
var knex = require('../lib/database').knex;

var internals = {
    /**
     * Retrieve the user's scope for the given request.
     * @param uid
     * @param request
     * @returns {Promise.<string[]>}
     */
    getScope: function(uid, request) {
        return co(function* () {
            // ID of the object being checked
            var id = request.params.id;
            // Use the type to retrieve the project id if needed
            var type = request.route.settings.plugins.permission.type;

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
                    return [];
                }
            }
        })
    }
};

var permission = {
    register: function(server, options, next) {
        server.expose('scopeFunction', internals.getScope);

        next();
    }
};
permission.register.attributes = {
    name: 'permission',
    version: '0.1.0'
};

module.exports = permission;