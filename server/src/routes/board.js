var Handler = require('../handlers/board');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'POST',
        path: API.route + '/boards',
        handler: Handler.create,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
            },
            cors: true,
            validate: {
                payload: {
                    title: Joi.string().min(1).max(100).required(),
                    project_id: Joi.number().integer().required()
                }
            },
            plugins: {
                permission: {
                    type: 'boards'
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/boards/{id}/update',
        handler: Handler.update,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
            },
            cors: true,
            validate: {
                payload: {
                    title: Joi.string().min(1).max(100).required(),
                    project_id: Joi.number().integer().required()
                }
            },
            plugins: {
                permission: {
                    type: 'boards'
                }
            }
        }
    },
    {
        method: 'GET',
        path: API.route + '/boards/{id}',
        handler: Handler.retrieve,
        config: {
            auth: {
                strategy: 'jwt',
                mode: 'try',
                scope: ['admin', 'member', 'viewer']
            },
            cors: true,
            validate: {
                params: {
                    id: Joi.number().integer().required()
                },
                query: {
                    token: Joi.string()
                }
            },
            plugins: {
                permission: {
                    type: 'projects'
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/boards/{id}/delete',
        handler: Handler.deleteSelf,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
            },
            cors: true,
            validate: {
                params: {
                    id: Joi.number().integer().required()
                }
            },
            plugins: {
                permission: {
                    type: 'boards'
                }
            }
        }
    }
];

module.exports = routes;