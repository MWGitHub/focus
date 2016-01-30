"use strict";

var Knex = require('knex');
var Bookshelf = require('bookshelf');
var Knexfile = require('../../knexfile');
var logger = require('./logger');

var environment = process.env.NODE_ENV;
var config = Knexfile.development;
if (environment && environment === 'production') {
    logger.info('Running the database in production mode');
    config = Knexfile.production;
} else if (environment && environment === 'test') {
    logger.info('Running the database in test mode');
    config = Knexfile.test;
} else {
    logger.info('Running the database in development mode');
    config = Knexfile.development;
}

var knex = Knex(config);
var bookshelf = Bookshelf(knex);
bookshelf.plugin('registry');

module.exports = {
    knex: knex,
    bookshelf: bookshelf
};