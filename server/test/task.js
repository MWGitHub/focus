"use strict";
var assert = require('chai').assert;
var Helper = require('./helpers/helper');
var co = require('co');
var _ = require('lodash');

describe('task', function() {
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

    it('should create a task', function(done) {
        co(function* () {
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks';
            let payload = {
                method: 'POST',
                url: '',
                headers: {
                    authorization: null
                },
                payload: {
                    title: 'new'
                }
            };

            // Admin should be able to create a task
            var admin = helper.userSeeds[0];
            let response = yield helper.inject(payload, admin, url, {pid: 0, bid: 0, lid: 0});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'new');

            // Admin should be able to create a task in a public project
            let clone = _.cloneDeep(payload);
            clone.payload.title = 'another';
            response = yield helper.inject(clone, admin, url, {pid: 1, bid: 2, lid: 6});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'another');

            // Member should be able to create a task
            var member = helper.userSeeds[1];
            response = yield helper.inject(payload, member, url, {pid: 2, bid: 4, lid: 12});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'new');

            // Member should be able to create a task in a public project
            response = yield helper.inject(payload, member, url, {pid: 1, bid: 2, lid: 6});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'new');

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid users to create a task', function(done) {
        co(function* () {
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks';
            let payload = {
                method: 'POST',
                url: '',
                headers: {
                    authorization: null
                },
                payload: {
                    title: 'new'
                }
            };

            // Viewer should not be able to create a task in a private project
            var viewer = helper.userSeeds[2];
            let response = yield helper.inject(payload, viewer, url, {pid: 2, bid: 5, lid: 15});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to create a task in a public project
            response = yield helper.inject(payload, viewer, url, {pid: 3, bid: 6, lid: 18});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger should not be able to create a task in a private project
            var stranger = helper.userSeeds[4];
            response = yield helper.inject(payload, stranger, url, {pid: 0, bid: 0, lid: 0});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger should not be able to create a task in a public project
            response = yield helper.inject(payload, stranger, url, {pid: 1, bid: 2, lid: 6});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Unauthorized should not be able to create a task in a project
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/boards/2/lists/6/tasks',
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

    it('should not allow invalid inputs for a task', function(done) {
        co(function* () {
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks';
            var payload = {
                method: 'POST',
                url: '',
                headers: {
                    authorization: null
                },
                payload: {
                    title: 'new'
                }
            };
            var admin = helper.userSeeds[0];
            // Title too long
            let clone = _.cloneDeep(payload);
            clone.payload.title = _.pad('a', 500, 'b');
            var response = yield helper.inject(clone, admin, url, {pid: 0, bid: 0, lid: 0});
            assert.equal(response.statusCode, Helper.Status.error);

            // Title does not exist
            clone = _.cloneDeep(payload);
            delete clone.payload;
            response = yield helper.inject(clone, admin, url, {pid: 0, bid: 0, lid: 0});
            assert.equal(response.statusCode, Helper.Status.error);

            // Invalid list
            response = yield helper.inject(payload, admin, url, {pid: 0, bid: 0, lid: 3});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // List does not exist
            response = yield helper.inject(payload, admin, url, {pid: 0, bid: 0, lid: 3333});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Invalid board
            response = yield helper.inject(payload, admin, url, {pid: 0, bid: 2, lid: 0});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Invalid project
            response = yield helper.inject(payload, admin, url, {pid: 1, bid: 0, lid: 0});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should update a task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid users to update a task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs for updating task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should retrieve a task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid users to retrieve a task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs for retrieving task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should delete a task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid users to delete a task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs for deleting task', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });
});