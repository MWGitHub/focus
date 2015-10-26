var ProjectAPI = require('../handlers/project');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'GET',
        path: API.route + '/projects/{id}',
        handler: ProjectAPI.retrieve,
        config: {
            auth: {
                strategy: 'jwt',
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
            }
        }
    }
];

module.exports = routes;