var BoardAPI = require('../handlers/board');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'GET',
        path: API.route + '/boards/{id}',
        handler: BoardAPI.retrieve,
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