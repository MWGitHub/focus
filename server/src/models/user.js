var Bookshelf = require('../lib/bookshelf');
var Permission = require('../auth/permission-model');
var co = require('co');
var _ = require('lodash');

var User = Bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: ['created_at', 'updated_at'],

    initialize: function() {
        this.on('destroying', this._destroyDeep, this);
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
        });
    },

    /**
     * Retrieves the data of the board.
     * @param {Boolean?} isDeep true to retrieve all children data else retrieve keys to the children.
     * @param {Array.<String>?} columns the columns to retrieve or all if none specified.
     * @return {Promise} the promise with the data.
     */
    retrieve: function(isDeep, columns) {
        "use strict";

        var instance = this;
        return co(function* () {
            var output = {
                type: 'users',
                id: instance.get('id'),
                attributes: {}
            };
            if (!columns) {
                output.attributes.username = instance.get('username');
                output.attributes.timezone = instance.get('timezone');
                output.attributes.email = instance.get('email');
                output.attributes.verified = instance.get('verified');
            } else {
                for (var i = 0; i < columns.length; i++) {
                    var column = columns[i];
                    output.attributes[column] = instance.get(column);
                }
            }
            return output;
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
    },

    /**
     *
     * @param {string?} username the username to search, omits username if none given.
     * @param {string?} email the verified email to search, omits email if none given.
     * @returns {Promise} promise with the user if found or null if none found.
     */
    findUser: function(username, email) {
        var knex = Bookshelf.knex;
        var query = '';
        var params = [];
        if (username) {
            query += 'username = ?';
            params.push(username);
        }
        if (email) {
            var needsClose = false;
            if (query) {
                query += ' or (';
                needsClose = true;
            }
            query += 'email = ? and verified = true';
            if (needsClose) {
                query += ')';
            }
            params.push(email);
        }
        return knex.select('*').from('users').whereRaw(query, params).limit(1).then(function(users) {
            return users[0];
        });
    }
});

module.exports = User;