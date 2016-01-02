var Handler = require('../handlers/list');
var Joi = require('joi');
var API = require('../lib/api');

var internals = {
    route: API.route + '/projects/{project_id}/boards/{board_id}',
    paramsCreate: {
        project_id: Joi.number().integer().required(),
        board_id: Joi.number().integer().required()
    },
    params: {
        id: Joi.number().integer().required(),
        project_id: Joi.number().integer().required(),
        board_id: Joi.number().integer().required()
    }
};

module.exports = [
    {
        method: 'POST',
        path: internals.route + '/lists',
        handler: Handler.create,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
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
                    type: 'lists'
                }
            }
        }
    },
    {
        method: 'POST',
        path: internals.route + '/lists/{id}/update',
        handler: Handler.update,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
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
                    type: 'lists'
                }
            }
        }
    },
    {
        method: 'GET',
        path: internals.route + '/lists/{id}',
        handler: Handler.retrieve,
        config: {
            auth: {
                strategy: 'jwt',
                mode: 'try',
                scope: ['admin', 'member', 'viewer']
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
                    type: 'lists'
                }
            }
        }
    },
    {
        method: 'POST',
        path: internals.route + '/lists/{id}/delete',
        handler: Handler.deleteSelf,
        config: {
            auth: {
                strategy: 'jwt',
                scope: ['admin']
            },
            cors: true,
            validate: {
                params: internals.params
            },
            plugins: {
                permission: {
                    type: 'lists'
                }
            }
        }
    }
];