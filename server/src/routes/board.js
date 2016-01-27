var Handler = require('../handlers/board');
var Joi = require('joi');
var API = require('../lib/api');

var internals = {
    route: API.route + '/projects/{project_id}',
    paramsCreate: {
        project_id: Joi.number().integer().required()
    },
    params: {
        id: Joi.number().integer().required(),
        project_id: Joi.number().integer().required()
    }
};

module.exports = [
    {
        method: 'POST',
        path: internals.route + '/boards',
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
                    title: Joi.string().min(1).max(100).required()
                },
                params: internals.paramsCreate
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
        path: internals.route + '/boards/{id}/update',
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
                    title: Joi.string().min(1).max(100).required()
                },
                params: internals.params
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
        path: internals.route + '/boards/{id}',
        handler: Handler.retrieve,
        config: {
            auth: {
                strategy: 'jwt',
                mode: 'try',
                access: {
                    scope: ['admin', 'member', 'viewer']
                }
            },
            cors: true,
            validate: {
                params: internals.params,
                query: {
                    token: Joi.string(),
                    deep: Joi.boolean()
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
        path: internals.route + '/boards/{id}/delete',
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
                params: internals.params
            },
            plugins: {
                permission: {
                    type: 'boards'
                }
            }
        }
    }
];