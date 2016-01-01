var assert = require('chai').assert;
var Helper = require('./helpers/helper');
var co = require('co');
var _ = require('lodash');

describe('board', function() {
    /**
     * @type {Helper}
     */
    var helper;

    beforeEach(function(done) {
        helper = new Helper();
        helper.startup().then(function() {
            done();
        });
    });

    afterEach(function(done) {
        helper.teardown().then(function() {
            done();
        });
    });

    it('should create a board', function(done) {
        co(function* () {
            // Should be able to create board for private project
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: 'new'
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'new');

            // Should be able to create board for public project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: 'another'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'another');

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow non admins to create a board', function(done) {
        co(function* () {
            // Member of a project should not be able to create a board
            var member = helper.userSeeds[1];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards',
                headers: {
                    authorization: yield helper.login(member)
                },
                payload: {
                    title: 'new'
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger of a project should not be able to create a board
            var stranger = helper.userSeeds[4];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards',
                headers: {
                    authorization: yield helper.login(stranger)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer of a project should not be able to create a board
            var viewer = helper.userSeeds[4];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/2/boards',
                headers: {
                    authorization: yield helper.login(viewer)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Unauthorized should not be able to create a board
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards',
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs when creating a board', function(done) {
        co(function* () {
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: 'new'
                }
            };
            // No inputs
            var clone = _.cloneDeep(payload);
            delete clone.payload;
            var response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Invalid project ID
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/129387/boards';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Title missing
            clone = _.cloneDeep(payload);
            delete clone.payload.title;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Title too long
            clone = _.cloneDeep(payload);
            clone.payload.title = _.pad('test', 200, 'a');
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should update the board', function(done) {
        co(function* () {
            // Should be able to update a private board
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/0/update',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: 'changed'
                }
            };

            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'changed');

            // Should be able to update a public board
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/0/update',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: 'another'
                }
            };

            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'another');

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow non admins from updating the board', function(done) {
        co(function* () {
            // Member should not be allowed to update a public board
            var member = helper.userSeeds[1];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/0/update',
                headers: {
                    authorization: yield helper.login(member)
                },
                payload: {
                    title: 'changed'
                }
            };

            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Member should not be allowed to update a private board
            var clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/2/boards/0/update';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be allowed to update a board
            var viewer = helper.userSeeds[2];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/0/update',
                headers: {
                    authorization: yield helper.login(viewer)
                },
                payload: {
                    title: 'changed'
                }
            };

            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Unauthorized should not be allowed to update a board
            response = yield helper.inject({
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/0/update',
                payload: {
                    title: 'changed'
                }
            });
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            // Stranger should not be allowed to update a public board
            var stranger = helper.userSeeds[4];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/0/update',
                headers: {
                    authorization: yield helper.login(stranger)
                },
                payload: {
                    title: 'changed'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger should not be allowed to update a private board
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/2/boards/0/update';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs on update the board', function(done) {
        co(function* () {
            // Should not allow titles that are too long
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/0/update',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: _.pad('yes', 200, 'a')
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.error);

            // Should not allow no title
            var clone = _.cloneDeep(payload);
            delete clone.payload;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should retrieve the board', function(done) {
        co(function* () {
            // Retrieve a private board as an admin
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/0/boards/0?token=' + (yield helper.login(admin))
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, helper.boardSeeds[0].title);

            // Retrieve a public board as an admin
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/1/boards/2?token=' + (yield helper.login(admin))
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, helper.boardSeeds[2].title);

            // Retrieve a private board as a member
            var member = helper.userSeeds[1];
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/2/boards/5?token=' + (yield helper.login(member))
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, helper.boardSeeds[5].title);

            // Retrieve a public board as a member
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/1/boards/2?token=' + (yield helper.login(member))
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, helper.boardSeeds[2].title);

            // Retrieve a private board as viewer
            var viewer = helper.userSeeds[2];
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/2/boards/4?token=' + (yield helper.login(viewer))
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, helper.boardSeeds[4].title);

            // Retrieve a public board as a stranger
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/1/boards/2?token=' + (yield helper.login(viewer))
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, helper.boardSeeds[2].title);

            // Retrieve a public board as unauthorized
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/1/boards/2'
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow strangers from retrieving a private board', function(done) {
        co(function* () {
            // Attempt to retrieve a private board as a stranger
            var stranger = helper.userSeeds[4];
            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/0/boards/0?token=' + (yield helper.login(stranger))
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Attempt to retrieve a private board as unauthorized
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/0/boards/0'
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should handle retrieving invalid boards', function(done) {
        co(function* () {
            // Attempt to retrieve a board that does not exist in the project
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/0/boards/3?token=' + (yield helper.login(admin))
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.internal);

            // Attempt to retrieve a board that does not exist in a project that does not exist
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/500/boards/1000?token=' + (yield helper.login(admin))
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should delete a board', function(done) {
        co(function* () {
            // Should be able to delete a private board
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/0/delete',
                headers: {
                    authorization: yield helper.login(admin)
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);

            // Should be able to delete a public board
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/delete',
                headers: {
                    authorization: yield helper.login(admin)
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow non admins from deleting a board', function(done) {
        co(function* () {
            // Member should not be able to delete a private board
            var member = helper.userSeeds[1];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/2/boards/4/delete',
                headers: {
                    authorization: yield helper.login(member)
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Member should not be able to delete a public board
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/delete',
                headers: {
                    authorization: yield helper.login(member)
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to delete a private board
            var viewer = helper.userSeeds[2];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/2/boards/4/delete',
                headers: {
                    authorization: yield helper.login(viewer)
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to delete a public board
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/3/boards/6/delete',
                headers: {
                    authorization: yield helper.login(viewer)
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to delete a private board
            var guest = helper.userSeeds[4];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/2/boards/4/delete',
                headers: {
                    authorization: yield helper.login(guest)
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to delete a public board
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/3/boards/6/delete',
                headers: {
                    authorization: yield helper.login(guest)
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Unauthorized should not be able to delete a public board
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/3/boards/6/delete'
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should handle invalid deletions for a board', function(done) {
        co(function* () {
            // Delete a board that does not exist in a valid project
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/3000/delete',
                headers: {
                    authorization: yield helper.login(admin)
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Delete a board that is in the wrong project url
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/3/delete',
                headers: {
                    authorization: yield helper.login(admin)
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.internal);

            // Delete a board that is in a project that does not exist
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1050/boards/3/delete',
                headers: {
                    authorization: yield helper.login(admin)
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.internal);

            done();
        }).catch(function(e) {
            done(e);
        });
    });
});