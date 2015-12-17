var ProjectAPI = require('../handlers/project');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'POST',
        path: API.route + '/projects',
        handler: ProjectAPI.create,
        config: {
            auth: 'jwt',
            cors: true,
            validate: {
                payload: {
                    title: Joi.string().min(1).max(60).required(),
                    is_public: Joi.boolean()
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/projects/{id}/update',
        handler: ProjectAPI.update,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
            },
            cors: true,
            validate: {
                payload: {
                    title: Joi.string().min(1).max(60),
                    is_public: Joi.boolean()
                }
            },
            plugins: {
                permission: {
                    type: 'project'
                }
            }
        }
    },
    {
        method: 'GET',
        path: API.route + '/projects/{id}',
        handler: ProjectAPI.retrieve,
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
                    token: Joi.string(),
                    isDeep: Joi.boolean()
                }
            },
            plugins: {
                permission: {
                    type: 'project'
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/projects/{id}/delete',
        handler: ProjectAPI.deleteSelf,
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
                    type: 'project'
                }
            }
        }
    }
];

module.exports = routes;