var Bookshelf = require('../lib/bookshelf');
var Project = require('./project');
var Permission = require('../auth/permission-model');
var co = require('co');
var _ = require('lodash');

var User = Bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: ['created_at', 'updated_at'],

    initialize: function() {
        this.on('destroying', this._destroyDeep, this);
    },

    projects: function() {
        return this.hasMany(Project, 'user_id');
    },

    permissions: function() {
        return this.hasMany(Permission.ProjectPermission, 'user_id');
    },

    /**
     * Destroys all related objects
     * @param model
     * @param attrs
     * @param options
     * @returns {*|Promise}
     * @private
     */
    _destroyDeep: function(model, attrs, options) {
        "use strict";

        var instance = this;

        return co(function* () {
            // Destroy all permissions
            var permissions = yield instance.permissions().fetch();
            yield permissions.invokeThen('destroy');
            // Destroy all projects owned by the user
            var projects = yield instance.projects().fetch();
            yield projects.invokeThen('destroy');
            return yield instance.destroy();
        });
    },

    /**
     * Retrieves the data of the board.
     * @param {Boolean?} isDeep true to retrieve all children data else retrieve up to children properties.
     * @return {Promise} the promise with the data.
     */
    retrieveAsData: function(isDeep) {
        "use strict";

        var instance = this;
        return co(function* () {
            var projects = yield instance.projects().fetch();
            if (!isDeep) {
                var pids = _.map(projects.models, function(n) {
                    return {
                        id: n.id,
                        type: 'projects',
                        attributes: {
                            title: n.attributes.title
                        }
                    };
                });
                return {
                    type: 'users',
                    id: instance.get('id'),
                    attributes: {
                        username: instance.get('username'),
                        timezone: instance.get('timezone'),
                        projects: pids
                    }
                };
            } else {
                var data = {
                    type: 'users',
                    id: instance.get('id'),
                    attributes: {
                        username: instance.get('username'),
                        timezone: instance.get('timezone'),
                        projects: []
                    }
                };
                for (var i = 0; i < projects.length; i++) {
                    var project = projects.models[i];
                    var projectData = yield project.retrieveAsData(isDeep);
                    data.attributes.projects.push(projectData);
                }
                return data;
            }
        });
    }
}, {
    schema: {
        id: {type: 'increments', notNullable: true, primary: true},
        username: {type: 'string', length: 30, notNullable: true, unique: true},
        password: {type: 'string', length: 60, notNullable: true},
        // Time zone is used to determine when midnight is for the user
        timezone: {type: 'string', length: 150, notNullable: true},
        // Optional e-mail for the user
        email: {type: 'string'},
        // True if the e-mail has been verified
        verified: {type: 'boolean'}
    }
});

module.exports = User;