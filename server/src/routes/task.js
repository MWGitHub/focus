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
                    position: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER).required()
                }
            },
            cors: true
        }
    },
    // TODO: Refactor to use PUT
    {
        method: 'POST',
        path: API.route + '/tasks/update/position',
        handler: TaskAPI.updatePosition,
        config: {
            auth: 'jwt',
            validate: {
                payload: {
                    id: Joi.number().integer().required(),
                    list_id: Joi.number().integer().required(),
                    position: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER).required()
                }
            },
            cors: true
        }
    },
    {
        method: 'POST',
        path: API.route + '/tasks/update/title',
        handler: TaskAPI.updateTitle,
        config: {
            auth: 'jwt',
            validate: {
                payload: {
                    id: Joi.number().integer().required(),
                    title: Joi.string().min(1).max(30).required()
                }
            },
            cors: true
        }
    },
    {
        method: 'DELETE',
        path: API.route + '/tasks/{id}',
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