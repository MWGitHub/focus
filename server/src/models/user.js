var Bookshelf = require('../lib/database').bookshelf;
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
     * @param {{name: string, isDeep: boolean}[]?} columns the columns to retrieve or all if none specified.
     * @return {Promise} the promise with the data.
     */
    retrieve: function(columns) {
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
                    if (instance.has(column.name)) {
                        output.attributes[column.name] = instance.get(column.name);
                    }
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
        email: {type: 'string', unique: true},
        // True if the e-mail has been verified
        verified: {type: 'boolean'}
    },

    /**
     * Columns to retrieve.
     * @type {{owner: *[], guest: *[]}}
     */
    retrievals: {
        owner: [
            {name: 'username'},
            {name: 'timezone'},
            {name: 'email'}
        ],
        guest: [
            {name: 'username'}
        ]
    },

    /**
     * Find a user by username or email.
     * @param {string?} username the username to search, omits username if none given.
     * @param {string?} email the email to search, omits email if none given.
     * @returns {Promise} promise with the user if found or null if none found.
     */
    findUser: function(username, email) {
        if (!username && !email) {
            return null;
        }

        var query = {};
        if (username) {
            query.where = {
                username: username.toLowerCase()
            };
        } else {
            query.where = {
                email: email.toLowerCase()
            };
        }
        if (username && email) {
            query.orWhere = {
                email: email.toLowerCase()
            };
        }

        return User.query(query).fetch();
    }
});

module.exports = User;