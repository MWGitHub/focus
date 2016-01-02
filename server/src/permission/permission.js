"use strict";
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
        let options = request.route.settings.plugins.permission;
        // ID of the object being checked if available
        let id = request.params.id;
        // Use the type to retrieve the project id if needed
        var typeString = options ? options.type : request.params.type;

        // Invalid type, return empty scopes
        if (!internals.types[typeString]) {
            return [];
        }

        // console.log('uid: ' + uid + '   id: ' + id + '      type: ' + type);
        let type = internals.types[typeString];
        let allowsViewers = _.indexOf(request.route.settings.auth.scope, 'viewer') >= 0;
        // Check if the table is a base table
        let isBase = !!type.permissionTable;
        // Find the base and the type chain excluding the base
        let base = null;
        let current = type;
        let types = [];
        while (current) {
            if (!current.through) {
                base = current;
                break;
            }
            types.push(current);
            current = internals.types[current.through];
        }
        // Set the base fields
        let permissionTable = base.permissionTable;
        let relationField = base.relation;
        let userField = base.userRelation;
        let publicField = base.publicField;
        let table = null;
        if (base.publicField) {
            table = base.table;
        }

        // Find the role of the user with the base
        let role = null;
        if (!isBase) {
            // Not a base, traverse hierarchy until base table is hit to confirm valid hierarchy.
            // Params base ID is not used as it does not actually check if the given info is valid for the children.

            // Parent ID used when creating a child
            let parentID = request.params[types[0].relation];
            // Runs a sub query if the current type has a child
            let subquery = function(types, index) {
                return function() {
                    let current = types[index];
                    if (index === 1 && !id) {
                        // Object is being created, use parent ID
                        this.select(current.relation).from(current.table).where(current.key, parentID);
                    } else {
                        // Subquery again if parents still exist and compare the relation with the keys
                        if (index > 0) {
                            this.whereIn(current.key, subquery(types, index - 1));
                        }
                        this.select(current.relation).from(current.table);
                        // Current type does not have any children
                        if (index === 0) {
                            this.where(current.key, id);
                        }
                    }
                };
            };

            //console.log('Query Start');
            let query = knex.select('role', userField, relationField).from(permissionTable);
            // First parent is base and is creating a new object
            if (types.length === 1 && !id) {
                query.where(types[types.length - 1].relation, parentID);
            } else {
                query.whereIn(relationField, subquery(types, types.length - 1));
            }
            query.orderBy(userField);
            //query.debug(true);
            let results = yield query;
            //console.log(results);
            if (results.length > 0) {
                // Find the matching user and set the role and the base ID
                let result = null;
                for (let i = 0; i < results.length; i++) {
                    if (results[i][userField] === uid) {
                        result = results[i];
                        break;
                    }
                }
                if (result) {
                    role = result.role;
                }
                // Retrieve the base ID
                id = results[0][relationField];
            }
        } else {
            let whereOptions = {};
            whereOptions[userField] = uid;
            whereOptions[relationField] = id;
            let roles = yield knex(permissionTable).where(whereOptions).select('role');
            if (roles.length > 0) {
                role = roles[0].role;
            }
        }

        if (role) {
            return [role];
        } else {
            // If the model is not able to be public or does not allow viewers return no roles
            if (!publicField || !allowsViewers) {
                return [];
            }
            // Check if model is public if no other roles exist for user
            var isPublic = false;
            var model = yield knex(table).where({
                id: id
            }).select(publicField);
            if (model.length > 0) {
                isPublic = model[0][publicField];
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
        console.log(e);
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