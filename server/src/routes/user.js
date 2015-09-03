var UserAPI = require('../handlers/user');
var Joi = require('joi');
var API = require('../lib/api');
var moment = require('moment-timezone');

var routes = [
    {
        method: 'POST',
        path: API.route + '/user/register',
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
    {
        method: 'POST',
        path: API.route + '/user/login',
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
        path: API.route + '/user/logout',
        handler: UserAPI.logout,
        config: {
            auth: {
                strategy: 'jwt',
                mode: 'optional'
            },
            cors: true
        }
    },
    {
        method: 'DELETE',
        path: API.route + '/user',
        handler: UserAPI.deleteSelf,
        config: {
            auth: 'jwt',
            cors: true
        }
    },
    {
        method: 'GET',
        path: API.route + '/user',
        handler: UserAPI.retrieve,
        config: {
            auth: 'jwt',
            cors: true
        }
    },
    {
        method: 'POST',
        path: API.route + '/user/update',
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