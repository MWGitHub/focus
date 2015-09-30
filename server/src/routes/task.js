var TaskAPI = require('../handlers/task');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'POST',
        path: API.route + '/tasks',
        handler: TaskAPI.create,
        config: {
            auth: 'jwt',
            validate: {
                payload: {
                    list_id: Joi.number().integer().required(),
                    title: Joi.string().min(1).max(30).required(),
                    position: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER).required(),
                    extra: Joi.boolean()
                }
            },
            cors: true
        }
    },
    {
        method: 'GET',
        path: API.route + '/tasks/{id}',
        handler: TaskAPI.retrieve,
        config: {
            auth: 'jwt',
            cors: true,
            validate: {
                params: {
                    id: Joi.number().integer().required(),
                },
                query: {
                    token: Joi.string(),
                    isDeep: Joi.boolean()
                }
            }
        }
    },
    {
        method: 'POST',
        path: API.route + '/tasks/{id}/update',
        handler: TaskAPI.update,
        config: {
            auth: 'jwt',
            validate: {
                payload: {
                    list_id: Joi.number().integer(),
                    position: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER),
                    title: Joi.string().min(1).max(30)
                },
                params: {
                    id: Joi.number().integer().required()
                }
            },
            cors: true
        }
    },
    {
        method: 'POST',
        path: API.route + '/tasks/{id}/delete',
        handler: TaskAPI.deleteSelf,
        config: {
            auth: 'jwt',
            validate: {
                params: {
                    id: Joi.number().integer().required()
                }
            },
            cors: true
        }
    }
];

module.exports = routes;