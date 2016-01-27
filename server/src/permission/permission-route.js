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
                access: {
                    scope: ['admin']
                }
            },
            cors: true,
            validate: {
                payload: {
                    user_id: Joi.number().integer().required(),
                    role: Joi.string().valid(Plugin.levels()).required()
                },
                params: {
                    type: Joi.string().valid(Plugin.types()),
                    id: Joi.number().integer()
                }
            }
        }
    },
    {
        method: 'GET',
        path: API.route + '/permissions/{type}/{id}',
        handler: Handler.retrieve,
        config: {
            auth: {
                strategy: 'jwt',
                access: {
                    scope: ['admin', 'member', 'viewer']
                },
                mode: 'try'
            },
            cors: true,
            validate: {
                query: {
                    token: Joi.string()
                },
                params: {
                    type: Joi.string().valid(Plugin.types()),
                    id: Joi.number().integer()
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/permissions/{type}/{id}/update',
        handler: Handler.update,
        config: {
            auth: {
                strategy: 'jwt',
                access: {
                    scope: ['admin']
                }
            },
            cors: true,
            validate: {
                payload: {
                    role: Joi.string().valid(Plugin.levels()).required(),
                    user_id: Joi.number().integer().required()
                },
                params: {
                    type: Joi.string().valid(Plugin.types()),
                    id: Joi.number().integer()
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/permissions/{type}/{id}/delete',
        handler: Handler.deleteSelf,
        config: {
            auth: {
                strategy: 'jwt',
                access: {
                    scope: ['admin']
                }
            },
            cors: true,
            validate: {
                payload: {
                    user_id: Joi.number().integer().required()
                },
                params: {
                    type: Joi.string().valid(Plugin.types()),
                    id: Joi.number().integer(),
                }
            }
        }
    }
];

module.exports = routes;