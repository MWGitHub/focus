var TaskAPI = require('../handlers/task');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'POST',
        path: API.route + '/task/create',
        handler: TaskAPI.create,
        config: {
            auth: 'simple',
            validate: {
                payload: {
                    list_id: Joi.number().integer().required(),
                    title: Joi.string().min(1).max(30).required(),
                    position: Joi.number().integer().required().min(0).max(Number.MAX_VALUE)
                }
            },
            cors: true
        }
    },
    {
        method: 'POST',
        path: API.route + '/task/update/position',
        handler: TaskAPI.updatePosition,
        config: {
            auth: 'simple',
            validate: {
                payload: {
                    id: Joi.number().integer().required(),
                    position: Joi.number().integer().min(0).max(Number.MAX_VALUE).required()
                }
            },
            cors: true
        }
    },
    {
        method: 'POST',
        path: API.route + '/task/update/title',
        handler: TaskAPI.updateTitle,
        config: {
            auth: 'simple',
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
        method: 'POST',
        path: API.route + '/task/delete',
        handler: TaskAPI.deleteSelf,
        config: {
            auth: 'simple',
            validate: {
                payload: {
                    id: Joi.number().integer().required()
                }
            },
            cors: true
        }
    }
];

module.exports = routes;