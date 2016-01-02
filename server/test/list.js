var assert = require('chai').assert;
var Helper = require('./helpers/helper');
var co = require('co');
var _ = require('lodash');

describe('list', function() {
    /**
     * @type {Helper}
     */
    var helper;

    beforeEach(function (done) {
        helper = new Helper();
        helper.startup().then(function () {
            done();
        });
    });

    afterEach(function (done) {
        helper.teardown().then(function () {
            done();
        });
    });

    it('should create a list', function(done) {
        co(function* () {
            // Admin should be able to create a list
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/0/lists',
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

            // Admin should be able to create a list in a public project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists',
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

    it('should not allow invalid users to create a list', function(done) {
        co(function* () {
            // Member should not be able to create a list
            var member = helper.userSeeds[1];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/0/lists',
                headers: {
                    authorization: yield helper.login(member)
                },
                payload: {
                    title: 'new'
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Member should not be able to create a list in a public project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists',
                headers: {
                    authorization: yield helper.login(member)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to create a list in a private project
            var viewer = helper.userSeeds[2];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/2/boards/5/lists',
                headers: {
                    authorization: yield helper.login(viewer)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to create a list in a public project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/3/boards/6/lists',
                headers: {
                    authorization: yield helper.login(viewer)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger should not be able to create a list in a private project
            var stranger = helper.userSeeds[4];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/0/lists',
                headers: {
                    authorization: yield helper.login(stranger)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger should not be able to create a list in a public project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists',
                headers: {
                    authorization: yield helper.login(stranger)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Unauthorized should not be able to create a list in a project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists',
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

    it('should not allow invalid inputs for a list', function(done) {
        co(function* () {
            // Title too long
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/0/lists',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: _.pad('a', 300, 'b')
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.error);

            // No title given
            var clone = _.cloneDeep(payload);
            delete clone.payload.title;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // List with board outside the project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/4/lists',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.error);

            // List with invalid project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/3/boards/1/lists',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: 'new'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.error);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should update a list', function(done) {
        co(function* () {
            // Admin should be able to update a list
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/boards/0/lists/0/update',
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

            // Admin should be able to update a list in a public project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists/6/update',
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

    it('should not allow invalid users to update a list', function(done) {
        co(function* () {
            // Member should not be able to update a public list
            var member = helper.userSeeds[1];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists/6/update',
                headers: {
                    authorization: yield helper.login(member)
                },
                payload: {
                    title: 'changed'
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Member should not be able to update a private list
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/2/boards/4/lists/12/update',
                headers: {
                    authorization: yield helper.login(member)
                },
                payload: {
                    title: 'changed'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to update a public list
            var viewer = helper.userSeeds[2];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/3/boards/6/lists/18/update',
                headers: {
                    authorization: yield helper.login(viewer)
                },
                payload: {
                    title: 'changed'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger should not be able to update a public list
            var stranger = helper.userSeeds[4];
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/3/boards/6/lists/18/update',
                headers: {
                    authorization: yield helper.login(stranger)
                },
                payload: {
                    title: 'changed'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Unauthorized should not be able to update a public list
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/3/boards/6/lists/18/update',
                payload: {
                    title: 'changed'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs for updating list', function(done) {
        co(function* () {
            // Should not allow titles that are too long
            var admin = helper.userSeeds[0];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists/6/update',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: _.pad('a', 400, 'b')
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.error);

            // Should not allow no title
            var clone = _.cloneDeep(payload);
            delete clone.payload;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Should not allow lists that do not exist
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists/600/update',
                headers: {
                    authorization: yield helper.login(admin)
                },
                payload: {
                    title: 'valid'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Should not allow lists that are in the wrong board
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/1/boards/2/lists/0/update';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Should not allow lists that are in the wrong project
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/0/boards/2/lists/6/update';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should retrieve a list', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid users to retrieve a list', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs for retrieving list', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should delete a list', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid users to delete a list', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs for deleting list', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });
});