var StaleAPI = require('../handlers/stale');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'GET',
        path: API.route + '/stale/{bid}',
        handler: StaleAPI.retrieveStaleness,
        config: {
            auth: 'jwt',
            cors: true,
            validate: {
                params: {
                    bid: Joi.number().integer().required()
                }
            }
        }
    }
];

module.exports = routes;