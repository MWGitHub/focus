var assert = require('chai').assert;
var Lab = require('lab');
var User = require('../src/models/user');
var List = require('../src/models/List');
var Task = require('../src/models/task');
var Auth = require('../src/lib/auth');
var API = require('../src/lib/api');
var helper = require('./helper');

var lab = exports.lab = Lab.script();
var server = require('../index');

var testTaskTitle = 'testtask1';

lab.experiment('test task', function() {
    "use strict";

    // List of user IDs.
    var userIds = [];

    // List ID to work on for the first user.
    var idList1User1;
    var idList2User1;

    // List ID for the second user.
    var idList1User2;

    var taskUser1Id;
    var taskUser2Id;

    var jwt = [];

    lab.before(function(done) {
        console.log('\nBefore: Removing any previous test users and creating new test users');
        // Remove all test users if exists
        helper.removeAllTestUsers().then(function() {
            return helper.createAllTestUsers();
        }).then(function(users) {
            var logins = [];
            for (var i = 0; i < users.length; i++) {
                userIds.push(users[i].id);
                var token = Auth.generateToken(users[i].id);
                jwt.push(token);
                logins.push(Auth.login(token));
            }

            Promise.all(logins).then(function() {
                List.where({user_id: userIds[0]}).fetchAll().then(function(collection) {
                    idList1User1 = collection.models[0].id;
                    idList2User1 = collection.models[1].id;
                }).then(function() {
                    return List.where({user_id: userIds[1]}).fetchAll().then(function(collection) {
                        idList1User2 = collection.models[0].id;
                    });
                }).then(function() {
                    done();
                });
            });
        });
    });

    lab.after(function(done) {
        console.log('\nAfter: Removing all test users');

        helper.removeAllTestUsers().then(function() {
            //server.stop(done);
            done();
        });
    });

    lab.test('create', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                title: testTaskTitle,
                list_id: idList1User1,
                position: 500
            }
        }, function(response) {
            // Save the ID for later use
            Task.forge({title: testTaskTitle, list_id: idList1User1}).fetch().then(function(task) {
                taskUser1Id = task.get('id');

                assert.equal(response.statusCode, 200);
                done();
            });
        });
    });

    lab.test('create extra', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                title: 'extraTask',
                list_id: idList1User1,
                position: 500,
                extra: true
            }
        }, function(response) {
            Task.forge({title: 'extraTask', list_id: idList1User1}).fetch().then(function(task) {
                assert.equal(response.statusCode, 200);
                assert.equal(task.get('extra'), true);
                done();
            });
        });
    });

    lab.test('get should return not found', function(done) {
        server.inject({
            method: 'GET',
            url: helper.apiRoute + '/tasks',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                title: testTaskTitle,
                list_id: idList1User1,
                position: 500
            }
        }, function(response) {
            assert.equal(response.statusCode, 404);
            done();
        });
    });

    lab.test('create title too long', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                title: 'testtask1au98_a3w5/<html>/</html>awoeirju3543534534534534534534szdfawer',
                list_id: idList1User1,
                position: 500
            }
        }, function(response) {
            assert.equal(response.statusCode, 400);
            done();
        });
    });

    lab.test('create title not given', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                list_id: idList1User1,
                position: 500
            }
        }, function(response) {
            assert.equal(response.statusCode, 400);
            done();
        });
    });

    lab.test('create list not given', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                title: testTaskTitle,
                position: 500
            }
        }, function(response) {
            assert.equal(response.statusCode, 400);
            done();
        });
    });

    lab.test('create position not given', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                title: testTaskTitle,
                list_id: idList1User1
            }
        }, function(response) {
            assert.equal(response.statusCode, 400);
            done();
        });
    });

    lab.test('check that created task exists', function(done) {
        Task.forge({title: testTaskTitle, user_id: userIds[0]}).fetch().then(function(task) {
            assert.isOk(task);
            done();
        });
    });

    lab.test('create for other user error', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks',
            headers: {
                //authorization: generateAuthHeader(testUsers[1], password)
                authorization: jwt[1]
            },
            payload: {
                title: 'testtask1',
                list_id: idList1User1,
                position: 500
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    lab.test('update position', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                id: taskUser1Id,
                position: 1
            }
        }, function(response) {
            Task.forge({id: taskUser1Id}).fetch().then(function(task) {
                assert.equal(task.get('position'), 1);
                done();
            });
        });
    });

    lab.test('move to other list', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                list_id: idList2User1,
                id: taskUser1Id,
                position: 1
            }
        }, function(response) {
            Task.forge({id: taskUser1Id}).fetch().then(function(task) {
                assert.equal(task.get('list_id'), idList2User1);
                done();
            });
        });
    });

    lab.test('move to other user list should fail', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                list_id: idList1User2,
                id: taskUser1Id,
                position: 1
            }
        }, function(response) {
            Task.forge({id: taskUser1Id}).fetch().then(function(task) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
    });

    lab.test('update position wrong user', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[1], password)
                authorization: jwt[1]
            },
            payload: {
                list_id: idList1User2,
                id: taskUser1Id,
                position: 1
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    lab.test('update title', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                id: taskUser1Id,
                title: 'wasd'
            }
        }, function(response) {
            Task.forge({id: taskUser1Id}).fetch().then(function(task) {
                assert.equal(task.get('title'), 'wasd');
                done();
            });
        });
    });

    lab.test('update title wrong user', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[1], password)
                authorization: jwt[1]
            },
            payload: {
                id: taskUser1Id,
                title: 'wasd'
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    lab.test('delete as other user error', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks/' + taskUser1Id + '/delete',
            headers: {
                //authorization: generateAuthHeader(testUsers[1], password)
                authorization: jwt[1]
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    lab.test('delete', function(done) {
        server.inject({
            method: 'POST',
            url: helper.apiRoute + '/tasks/' + taskUser1Id + '/delete',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            }
        }, function(response) {
            Task.forge({id: taskUser1Id}).fetch().then(function(task) {
                assert.notOk(task);
                done();
            });
        });
    });
});