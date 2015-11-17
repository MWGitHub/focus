var Knex = require('knex');
var Bookshelf = require('bookshelf');
var Knexfile = require('../../knexfile');

var config;
var environment = process.env.NODE_ENV;
if (environment && environment === 'production') {
    console.log('Running the database in production mode');
    config = Knexfile.production;
} else if (environment && environment === 'staging') {
    console.log('Running the database in staging mode');
    config = Knexfile.staging;
} else if (environment && environment === 'test') {
    console.log('Running the database in test mode');
    config = Knexfile.test;
} else {
    console.log('Running the database in development mode');
    config = Knexfile.development;
}

var knex = Knex(config);
var bookshelf = Bookshelf(knex);
module.exports = bookshelf;