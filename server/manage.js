/**
 * Application management commands.
 */
var API = require('./src/lib/api');
var User = require('./src/models/user');
var Board = require('./src/models/board');
var List = require('./src/models/list');
var Task = require('./src/models/task');
var program = require('commander');
var Auth = require('./src/lib/auth');
var knex = require('./src/lib/bookshelf').knex;

program.version('1.0.0');

program
    .command('create-basic-user <username> <password>')
    .description('Creates a basic use with no prepopulated data.')
    .action(function(username, password) {
        "use strict";
        console.log('Creating basic user...')

        User.forge({username: username}).fetch().then(function(user) {
            if (user) {
                console.error('User %s already exists, new user not created.', username);
                process.exit(1);
            } else {
                Auth.hash(password, function(error, hash) {
                    User.forge({username: username, password: hash}).save().then(function() {
                        console.log('Basic user %s created.', username);
                        process.exit(0);
                    });
                });
            }
        });
    });


program
    .command('create-user <username> <password>')
    .description('Create a user and populate with boards and lists.')
    .action(function(username, password) {
        console.log('Creating user and populating with boards and lists.');

        User.forge({username: username}).fetch().then(function(user) {
            "use strict";

            if (user) {
                console.error('User %s already exists, new user not created.', username);
                process.exit(1);
            } else {
                Auth.hash(password, function(error, hash) {
                    User.forge({username: username, password: hash}).save().then(function(user) {
                        "use strict";

                        API.populateUser(username).then(function() {
                            console.log('Finished populating boards and lists for ' + username);
                            process.exit(0);
                        });
                    });
                });
            }
        });
    });

program
    .command('delete-user <username>')
    .description('Deletes a user and all related data.')
    .action(function(username) {
        "use strict";

        User.forge({username: username}).fetch().then(function(user) {
            if (!user) {
                console.error('User %s does not exist, exiting.', username);
                process.exit(1);
            } else {
                user.destroyDeep().then(function() {
                    console.log('User has been deleted.');
                    process.exit(0);
                });
            }
        });
    });

program
    .command('tc')
    .description('Temporary command used for testing.')
    .action(function() {
        "use strict";

        /*
        var userWrap = function(userID, boardID) {
            return knex('lists').where({board_id: boardID})
                .update({
                    user_id: userID
                });
        };

        var boards = knex('boards').then(function(boards) {
            var promises = [];
            for (var i = 0; i < boards.length; i++) {
                promises.push(userWrap(boards[i].user_id, boards[i].id));
            }
            console.log(boards);
            return Promise.all(promises);
        });

        Promise.all([boards]).then(function() {
            process.exit(0);
        });
        */
    });

program.parse(process.argv);