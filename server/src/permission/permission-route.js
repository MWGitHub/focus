var Handler = require('./permission-handler');
var Plugin = require('./permission');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'POST',
        path: API.route + '/permissions/{type}/{id}',
        handler: Handler.create,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
            },
            cors: true,
            validate: {
                payload: {
                    user_id: Joi.number().integer().required(),
                    role: Joi.string().valid(Plugin.levels()).required()
                },
                params: {
                    type: Joi.string(),
                    id: Joi.number().integer()
                }
            }
        }
    },
    {
        method: 'GET',
        path: API.route + '/permissions',
        handler: Handler.retrieve,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin', 'member']
            },
            cors: true,
            validate: {
                query: {
                    token: Joi.string(),
                    user_id: Joi.number().integer(),
                    project_id: Joi.number().integer(),
                    role: Joi.string().valid(Plugin.levels())
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/permissions/delete',
        handler: Handler.deleteSelf,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
            },
            cors: true,
            validate: {
                params: {
                    id: Joi.number().integer(),
                    user_id: Joi.number().integer()
                }
            }
        }
    }
];

module.exports = routes;