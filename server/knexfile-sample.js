// Please at least change the user and password for the database.
var path = require('path');

module.exports = {
    test: {
        client: 'postgresql',
        connection: {
            database: 'test_focus',
            user:     'postgres',
            password: ''
        },
        pool: {
            min: 2,
            max: 4
        },
        migrations: {
            tableName: 'migrations',
            directory: path.join(__dirname, 'data', 'db', 'migrations')
        },
        seeds: {
            directory: path.join(__dirname, 'data', 'db', 'seeds')
        },
        debug: false
    },

    development: {
        client: 'postgresql',
        connection: {
            database: 'dev_focus',
            user:     'postgres',
            password: ''
        },
        pool: {
            min: 2,
            max: 4
        },
        migrations: {
            tableName: 'migrations',
            directory: path.join(__dirname, 'data', 'db', 'migrations')
        },
        seeds: {
            directory: path.join(__dirname, 'data', 'db', 'seeds')
        },
        debug: false
    },

    staging: {
        client: 'postgresql',
        connection: {
            database: 'stage_focus',
            user:     'postgres',
            password: ''
        },
        pool: {
            min: 2,
            max: 4
        },
        migrations: {
            tableName: 'migrations',
            directory: path.join(__dirname, 'data', 'db', 'migrations')
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            database: 'production_focus',
            user:     'postgres',
            password: ''
        },
        pool: {
            min: 2,
            max: 4
        },
        migrations: {
            tableName: 'migrations',
            directory: path.join(__dirname, 'data', 'db', 'migrations')
        }
    }
};