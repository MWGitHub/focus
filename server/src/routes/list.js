var ListAPI = require('../handlers/list');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'GET',
        path: API.route + '/lists/{id}',
        handler: ListAPI.retrieve,
        config: {
            auth: 'jwt',
            cors: true,
            validate: {
                params: {
                    id: Joi.number().integer().required()
                }
            }
        }
    }
];

module.exports = routes;