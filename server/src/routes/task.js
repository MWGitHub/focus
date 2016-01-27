var Handler = require('../handlers/task');
var Joi = require('joi');
var API = require('../lib/api');

var internals = {
    route: API.route + '/projects/{project_id}/boards/{board_id}/lists/{list_id}',
    paramsCreate: {
        project_id: Joi.number().integer().required(),
        board_id: Joi.number().integer().required(),
        list_id: Joi.number().integer().required()
    },
    params: {
        id: Joi.number().integer().required(),
        project_id: Joi.number().integer().required(),
        board_id: Joi.number().integer().required(),
        list_id: Joi.number().integer().required()
    }
};

module.exports = [
    {
        method: 'POST',
        path: internals.route + '/tasks',
        handler: Handler.create,
        config: {
            auth: {
                strategy: 'jwt',
                access: {
                    scope: ['admin', 'member']
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
                    type: 'tasks'
                }
            }
        }
    },
    {
        method: 'POST',
        path: internals.route + '/tasks/{id}/update',
        handler: Handler.update,
        config: {
            auth: {
                strategy: 'jwt',
                access: {
                    scope: ['admin', 'member']
                }
            },
            cors: true,
            validate: {
                payload: {
                    title: Joi.string().min(1).max(100),
                    list_id: Joi.number().integer()
                },
                params: internals.params
            },
            plugins: {
                permission: {
                    type: 'tasks'
                }
            }
        }
    },
    {
        method: 'GET',
        path: internals.route + '/tasks/{id}',
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
                    token: Joi.string()
                }
            },
            plugins: {
                permission: {
                    type: 'tasks'
                }
            }
        }
    },
    {
        method: 'POST',
        path: internals.route + '/tasks/{id}/delete',
        handler: Handler.deleteSelf,
        config: {
            auth: {
                strategy: 'jwt',
                access: {
                    scope: ['admin', 'member']
                }
            },
            cors: true,
            validate: {
                params: internals.params
            },
            plugins: {
                permission: {
                    type: 'tasks'
                }
            }
        }
    }
];