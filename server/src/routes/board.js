var BoardAPI = require('../handlers/board');
var Joi = require('joi');
var API = require('../lib/api');

var routes = [
    {
        method: 'GET',
        path: API.route + '/board/{id}',
        handler: BoardAPI.retrieve,
        config: {
            auth: 'jwt'
        }
    }
    /*
    {
        method: 'POST',
        path: API.route + '/board/create',
        handler: BoardAPI.register,
        config: {
            auth: 'simple',
            validate: {
                payload: {
                    title: Joi.string().min(1).max(30).required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: API.route + '/board/delete',
        handler: BoardAPI.register,
        config: {
            auth: 'simple'
        }
    },
    {
        method: 'GET',
        path: API.route + '/board',
        handler: BoardAPI.retrieve,
        config: {
            auth: 'simple'
        }
    }
    */
];

module.exports = routes;