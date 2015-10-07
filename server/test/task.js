var assert = require('chai').assert;
var Lab = require('lab');
var User = require('../src/models/user');
var List = require('../src/models/List');
var Task = require('../src/models/task');
var Auth = require('../src/auth/auth');
var Session = require('../src/auth/session');
var API = require('../src/lib/api');
var Helper = require('./helper');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;

var testTaskTitle = 'testtask1';

var server;
describe('task', function() {
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

    before(function(done) {
        console.log('\nBefore: Removing any previous test users and creating new test users');
        // Remove all test users if exists
        Helper.startServer().then(function(s) {
            server = s;
            return Helper.removeAllTestUsers();
        })
        .then(function() {
            return Helper.createAllTestUsers();
        }).then(function(users) {
            var logins = [];
            for (var i = 0; i < users.length; i++) {
                userIds.push(users[i].id);
                var token = Session.generateToken(users[i].id);
                jwt.push(token);
                logins.push(Session.login(token));
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

    after(function(done) {
        console.log('\nAfter: Removing all test users');

        Helper.removeAllTestUsers().then(function() {
            //server.stop(done);
            done();
        });
    });

    it('should create a task', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks',
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
            assert.equal(response.statusCode, 200);
            assert.equal(response.result.data.attributes.title, testTaskTitle);
            Task.forge({title: testTaskTitle, list_id: idList1User1}).fetch().then(function(task) {
                taskUser1Id = task.get('id');

                done();
            });
        });
    });

    it('should create a task with the extra flag', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks',
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
            assert.equal(response.result.data.attributes.extra, true);
            Task.forge({title: 'extraTask', list_id: idList1User1}).fetch().then(function(task) {
                assert.equal(response.statusCode, 200);
                assert.equal(task.get('extra'), true);
                done();
            });
        });
    });

    it('should return not found for a nonexistent task', function(done) {
        server.inject({
            method: 'GET',
            url: Helper.apiRoute + '/tasks',
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

    it('should return an error when creating and title is too long', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks',
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

    it('should return an error when creating and title is not given', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks',
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

    it('should return an error when creating and list is not given', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks',
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

    it('should return an error when creating and position is not given', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks',
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

    it('should check if a task has been created in the database with the matching user', function(done) {
        Task.forge({title: testTaskTitle, user_id: userIds[0]}).fetch().then(function(task) {
            assert.isOk(task);
            done();
        });
    });

    it('should return an error when creating a task for other user', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks',
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

    it('should retrieve a task', function(done) {
        server.inject({
            method: 'GET',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id,
            headers: {
                authorization: jwt[0]
            }
        }, function(response) {
            assert.equal(response.result.data.attributes.title, testTaskTitle);
            done();
        });
    });

    it('should retrieve from task, list, and board', function(done) {
        server.inject({
            method: 'GET',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id,
            headers: {
                authorization: jwt[0]
            }
        }, function(response) {
            var data = response.result.data;
            assert.equal(data.attributes.title, testTaskTitle);

            // Retrieve list
            var listId = data.attributes.list_id;
            server.inject({
                method: 'GET',
                url: Helper.apiRoute + '/lists/' + listId,
                headers: {
                    authorization: jwt[0]
                }
            }, function(response) {
                var listData = response.result.data;
                assert.equal(response.statusCode, 200);

                // Retrieve board
                var boardId = listData.attributes.board_id;
                server.inject({
                    method: 'GET',
                    url: Helper.apiRoute + '/boards/' + boardId,
                    headers: {
                        authorization: jwt[0]
                    }
                }, function(response) {
                    assert.equal(response.statusCode, 200);

                    // Retrieve as wrong user from list
                    server.inject({
                        method: 'GET',
                        url: Helper.apiRoute + '/lists/' + listId,
                        headers: {
                            authorization: jwt[1]
                        }
                    }, function(response) {
                        assert.equal(response.statusCode, 401);

                        // Retrieve as wrong user from boards
                        server.inject({
                            method: 'GET',
                            url: Helper.apiRoute + '/boards/' + boardId,
                            headers: {
                                authorization: jwt[1]
                            }
                        }, function(response) {
                            assert.equal(response.statusCode, 401);
                            done();
                        });
                    });
                });
            })
        });
    });

    it('should return an error when retrieving as another user', function(done) {
        server.inject({
            method: 'GET',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id,
            headers: {
                authorization: jwt[1]
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    it('should update position', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                position: 1
            }
        }, function(response) {
            assert.equal(response.result.data.attributes.position, 1);
            Task.forge({id: taskUser1Id}).fetch().then(function(task) {
                assert.equal(task.get('position'), 1);
                done();
            });
        });
    });

    it('should move to another list', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                list_id: idList2User1,
                position: 1
            }
        }, function(response) {
            assert.equal(response.result.data.attributes.list_id, idList2User1);
            Task.forge({id: taskUser1Id}).fetch().then(function(task) {
                assert.equal(task.get('list_id'), idList2User1);
                done();
            });
        });
    });

    it("should return an error when moving to other user's list", function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                list_id: idList1User2,
                position: 1
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    it('should return an error when updating position as an unauthorized user', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[1], password)
                authorization: jwt[1]
            },
            payload: {
                list_id: idList1User2,
                position: 1
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    it('should update title', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[0], password)
                authorization: jwt[0]
            },
            payload: {
                title: 'wasd'
            }
        }, function(response) {
            assert.equal(response.result.data.attributes.title, 'wasd');
            Task.forge({id: taskUser1Id}).fetch().then(function(task) {
                assert.equal(task.get('title'), 'wasd');
                done();
            });
        });
    });

    it('should return an error when updating title as the wrong user', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id + '/update',
            headers: {
                //authorization: generateAuthHeader(testUsers[1], password)
                authorization: jwt[1]
            },
            payload: {
                title: 'wasd'
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    it('should return an error when deleting a task as the wrong user', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id + '/delete',
            headers: {
                //authorization: generateAuthHeader(testUsers[1], password)
                authorization: jwt[1]
            }
        }, function(response) {
            assert.equal(response.statusCode, 401);
            done();
        });
    });

    it('should delete the task', function(done) {
        server.inject({
            method: 'POST',
            url: Helper.apiRoute + '/tasks/' + taskUser1Id + '/delete',
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