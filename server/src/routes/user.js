var UserAPI = require('../handlers/user');
var Joi = require('joi');
var API = require('../lib/api');
var moment = require('moment-timezone');

var routes = [
    {
        method: 'POST',
        path: API.route + '/users',
        handler: UserAPI.register,
        config: {
            validate: {
                payload: {
                    username: Joi.string().min(3).max(20).token().required(),
                    password: Joi.string().min(6).max(100).required(),
                    timezone: Joi.string().valid(moment.tz.names())
                }
            },
            cors: true
        }
    },
    // TODO: Perhaps change the route to /auth/login and logout
    {
        method: 'POST',
        path: API.route + '/users/login',
        handler: UserAPI.login,
        config: {
            validate: {
                payload: {
                    username: Joi.string().min(3).max(20).token().required(),
                    password: Joi.string().min(6).max(100).required()
                }
            },
            cors: true
        }
    },
    {
        method: 'GET',
        path: API.route + '/users/logout',
        handler: UserAPI.logout,
        config: {
            auth: {
                strategy: 'jwt',
                mode: 'try'
            },
            cors: true
        }
    },
    {
        method: 'DELETE',
        path: API.route + '/users/{id}',
        handler: UserAPI.remove,
        config: {
            auth: 'jwt',
            cors: true,
            validate: {
                params: {
                    id: Joi.number().integer().required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: API.route + '/users/{id}',
        handler: UserAPI.retrieve,
        config: {
            auth: {
                strategy: 'jwt',
                mode: 'try'
            },
            cors: true,
            validate: {
                params: {
                    id: Joi.number().integer().required()
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/users/age',
        handler: UserAPI.update,
        config: {
            validate: {
                payload: {
                    force: Joi.boolean()
                }
            },
            auth: 'jwt',
            cors: true
        }
    }
];

module.exports = routes;