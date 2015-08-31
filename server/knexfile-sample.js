// Update with your config settings.
var path = require('path');

module.exports = {
    development: {
        client: 'postgresql',
        connection: {
            database: 'focus',
            user:     'yourusername',
            password: 'yourpassword'
        },
        pool: {
            min: 2,
            max: 4
        },
        migrations: {
            tableName: 'migrations',
            directory: path.join(__dirname, 'data', 'db', 'migrations')
        },
        debug: false
    },

    staging: {
        client: 'postgresql',
        connection: {
            database: 'focus',
            user:     'yourusername',
            password: 'yourpassword'
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
            database: 'focus',
            user:     'yourusername',
            password: 'yourpassword'
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
