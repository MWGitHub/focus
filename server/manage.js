/**
 * Application management commands.
 */
var API = require('./src/lib/api');
var User = require('./src/models/user');
var program = require('commander');
var Auth = require('./src/auth/auth');
var knex = require('./src/lib/database').knex;
var co = require('co');

program.version('1.0.0');

/**
 * Checks if a user has been retrieved, exits if not.
 * @param {String} username
 * @param user
 */
function checkUserRetrieved(username, user) {
    if (user) return;
    console.error('User %s does not exist.', username);
    process.exit(1);
}

program
    .command('create-basic-user <username> <password>')
    .description('Creates a basic use with no prepopulated data.')
    .action(function(username, password) {
        "use strict";
        console.log('Creating basic user...')

        User.forge({username: username}).fetch().then(function(user) {
            if (user) {

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
                Auth.hash(password).then(function(hash) {
                    return User.forge({username: username, password: hash}).save();
                })
                .then(function(user) {
                    return API.populateUser(user).then(function () {
                        console.log('Finished populating boards and lists for ' + username);
                        process.exit(0);
                    });
                });
            }
        })
        .catch(function(e) {
            console.log(e);
            process.exit(1);
        });
    });

program
    .command('change-user-password <username> <password>')
    .description('Change a user\'s password.')
    .action(function(username, password) {
        var user;
        console.log('Changing password for user.');
        User.forge({username: username}).fetch({required: true}).then(function(v) {
            user = v;
            return Auth.hash(password);
        })
        .then(function(hash) {
            return user.save({'password': hash}, {patch: true});
        })
        .then(function() {
            console.log('User password has been updated');
            process.exit(0);
        })
        .catch(function(e) {
            console.error('User does not exist.');
            process.exit(1);
        });
    });

program
    .command('delete-user <username>')
    .description('Deletes a user and all related data.')
    .action(function(username) {
        "use strict";

        User.forge({username: username}).fetch().then(function(user) {
            checkUserRetrieved(username, user);
            user.destroyDeep().then(function() {
                console.log('User has been deleted.');
                process.exit(0);
            })
            .catch(function(e) {
                console.log(e);
                process.exit(1);
            });
        });
    });

program
    .command('update-user-tasks <username>')
    .description("Updates a user's tasks.")
    .option('-f, --force', 'Ignore time and force the update')
    .action(function(username, options) {
        User.forge({username: username}).fetch().then(function(user) {
            checkUserRetrieved(username, user);
            API.updateUserTasks(user, options.force).then(function() {
                console.log('Finished updating tasks for %s.', username);
                process.exit(0);
            });
        })
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

program
    .command('generate-seeds')
    .description('Generates seeds for the database.')
    .option('-n, --no-migrate', 'Do not run migrations')
    .option('-d, --delete', 'Delete all rows in tables')
    .action(function(options) {
        co(function* () {
            if (options.migrate) {
                yield knex.migrate.latest();
            }

            // Remove all data from tables
            if (options.delete) {
                yield knex('project_permissions').del();
                yield knex('tasks').del();
                yield knex('lists').del();
                yield knex('boards').del();
                yield knex('projects').del();
                yield knex('users').del();
            }

            // Set database sequence to not collide with seed ids
            yield knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1');
            yield knex.raw('ALTER SEQUENCE projects_id_seq RESTART WITH 1');
            yield knex.raw('ALTER SEQUENCE project_permissions_id_seq RESTART WITH 1');
            yield knex.raw('ALTER SEQUENCE boards_id_seq RESTART WITH 1');
            yield knex.raw('ALTER SEQUENCE lists_id_seq RESTART WITH 1');
            yield knex.raw('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');

            yield knex.seed.run();

            // Set database sequence to not collide with seed ids
            yield knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 10000');
            yield knex.raw('ALTER SEQUENCE projects_id_seq RESTART WITH 10000');
            yield knex.raw('ALTER SEQUENCE project_permissions_id_seq RESTART WITH 10000');
            yield knex.raw('ALTER SEQUENCE boards_id_seq RESTART WITH 10000');
            yield knex.raw('ALTER SEQUENCE lists_id_seq RESTART WITH 10000');
            yield knex.raw('ALTER SEQUENCE tasks_id_seq RESTART WITH 10000');

            process.exit(0);
        }).catch(function(e) {
            console.log(e);
            process.exit(1);
        });
    });

program.parse(process.argv);