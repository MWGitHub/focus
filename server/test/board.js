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
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow non admins from updating the board', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs on update the board', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should retrieve the board', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow strangers from retrieving a private board', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should handle retrieving invalid boards', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should delete a board', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow non admins from deleting a board', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should handle invalid deletions for a board', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });
});