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
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks/{id}/update';
            let payload = {
                method: 'POST',
                url: '',
                headers: {
                    authorization: null
                },
                payload: {}
            };

            // Admin should be able to update title
            let admin = helper.userSeeds[0];
            let clone = _.cloneDeep(payload);
            clone.payload.title = 'changed';
            let response = yield helper.inject(clone, admin, url, {pid: 0, bid: 0, lid: 0, id: 0});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'changed');

            // Admin should be able to move task to different list
            clone = _.cloneDeep(payload);
            clone.payload.list_id = 1;
            response = yield helper.inject(clone, admin, url, {pid: 0, bid: 0, lid: 0, id: 0});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'changed');
            assert.equal(response.result.data.attributes.list_id, 1);

            // Member should be able to update title
            let member = helper.userSeeds[1];
            clone = _.cloneDeep(payload);
            clone.payload.title = 'another';
            response = yield helper.inject(clone, member, url, {pid: 1, bid: 2, lid: 6, id: 18});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'another');

            // Member should be able to move task to different list
            clone = _.cloneDeep(payload);
            clone.payload.list_id = 7;
            response = yield helper.inject(clone, member, url, {pid: 1, bid: 2, lid: 6, id: 18});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'another');
            assert.equal(response.result.data.attributes.list_id, 7);

            // Should be able to move task to a different list in another board and same project and change title
            clone = _.cloneDeep(payload);
            clone.payload.title = 'a';
            clone.payload.list_id = 9;
            response = yield helper.inject(clone, member, url, {pid: 1, bid: 2, lid: 6, id: 19});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'a');
            assert.equal(response.result.data.attributes.list_id, 9);

            // Should be able to move task to a different project, board, and list
            clone = _.cloneDeep(payload);
            clone.payload.title = 'b';
            // Move to project 2, board 4, list 12
            clone.payload.list_id = 12;
            response = yield helper.inject(clone, member, url, {pid: 1, bid: 2, lid: 6, id: 20});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'b');
            assert.equal(response.result.data.attributes.list_id, 12);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid users to update a task', function(done) {
        co(function* () {
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks/{id}/update';
            let payload = {
                method: 'POST',
                url: '',
                headers: {
                    authorization: null
                },
                payload: {
                    title: 'changed'
                }
            };

            // Viewer should not be allowed to update a task in a private project
            let viewer = helper.userSeeds[2];
            let response = yield helper.inject(payload, viewer, url, {pid: 2, bid: 4, lid: 12, id: 36});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be allowed to update a task in a public project
            response = yield helper.inject(payload, viewer, url, {pid: 3, bid: 6, lid: 18, id: 54});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger should not be allowed to update a task in a private project
            let stranger = helper.userSeeds[4];
            response = yield helper.inject(payload, stranger, url, {pid: 2, bid: 4, lid: 12, id: 36});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Stranger should not be allowed to update a task in a public project
            response = yield helper.inject(payload, stranger, url, {pid: 3, bid: 6, lid: 18, id: 54});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Unauthorized should not be allowed to update a task in a private project
            response = yield helper.inject({
                method: 'POST',
                url: helper.parseURL(url, {pid: 0, bid: 0, lid: 0, id: 0}),
                payload: {
                    title: 'changed'
                }
            });
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            // Unauthorized should not be allowed to update a task in a public project
            response = yield helper.inject({
                method: 'POST',
                url: helper.parseURL(url, {pid: 1, bid: 2, lid: 6, id: 18}),
                payload: {
                    title: 'changed'
                }
            });
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs for updating task', function(done) {
        co(function* () {
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks/{id}/update';
            let payload = {
                method: 'POST',
                url: '',
                headers: {
                    authorization: null
                },
                payload: {}
            };

            // Admin should not be able to change list id to list they do not have permission in
            let admin = helper.userSeeds[0];
            let clone = _.cloneDeep(payload);
            // project 3, board 6, list 18
            clone.payload.list_id = 18;
            let response = yield helper.inject(clone, admin, url, {pid: 0, bid: 0, lid: 0, id: 0});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Title too long
            clone = _.cloneDeep(payload);
            clone.payload.title = _.pad('a', 500, 'b');
            response = yield helper.inject(clone, admin, url, {pid: 0, bid: 0, lid: 0, id: 0});
            assert.equal(response.statusCode, Helper.Status.error);

            // List does not exist
            clone = _.cloneDeep(payload);
            clone.payload.list_id = 1800;
            response = yield helper.inject(clone, admin, url, {pid: 0, bid: 0, lid: 0, id: 0});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // List param invalid
            response = yield helper.inject(clone, admin, url, {pid: 0, bid: 0, lid: 1, id: 0});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Board param invalid
            response = yield helper.inject(clone, admin, url, {pid: 0, bid: 1, lid: 0, id: 0});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Project param invalid
            response = yield helper.inject(clone, admin, url, {pid: 1, bid: 0, lid: 0, id: 0});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should retrieve a task', function(done) {
        co(function* () {
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks/{id}?token={token}';
            let payload = {
                method: 'GET'
            };

            // Admin should be able to view a private task
            let admin = yield helper.login(helper.userSeeds[0]);
            let response = yield helper.inject(payload, null, url, {pid: 0, bid: 0, lid: 0, id: 0, token: admin});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'title0');

            // Admin should be able to view a public task
            response = yield helper.inject(payload, null, url, {pid: 1, bid: 2, lid: 6, id: 18, token: admin});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'title18');

            // Member should be able to view a private task
            let member = yield helper.login(helper.userSeeds[1]);
            response = yield helper.inject(payload, null, url, {pid: 2, bid: 4, lid: 12, id: 36, token: member});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'title36');

            // Member should be able to view a public task
            response = yield helper.inject(payload, null, url, {pid: 1, bid: 2, lid: 8, id: 26, token: member});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'title26');

            // Viewer should be able to view a private task
            let viewer = yield helper.login(helper.userSeeds[2]);
            response = yield helper.inject(payload, null, url, {pid: 2, bid: 5, lid: 16, id: 49, token: viewer});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'title49');

            // Viewer should be able to view a public task
            response = yield helper.inject(payload, null, url, {pid: 3, bid: 6, lid: 18, id: 54, token: viewer});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'title54');

            // Stranger should be able to view a public task
            let stranger = yield helper.login(helper.userSeeds[4]);
            response = yield helper.inject(payload, null, url, {pid: 1, bid: 2, lid: 6, id: 19, token: stranger});
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'title19');

            // Guest should be able to view a public task
            response = yield helper.inject({
                method: 'GET',
                url: helper.apiRoute + '/projects/1/boards/2/lists/6/tasks/18'
            });
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'title18');

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid users to retrieve a task', function(done) {
        co(function* () {
            // Stranger should not be able to view private project
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks/{id}?token={token}';
            let payload = {
                method: 'GET'
            };
            let stranger = yield helper.login(helper.userSeeds[4]);
            let response = yield helper.inject(payload, null, url, {pid: 0, bid: 0, lid: 0, id: 0, token: stranger});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Guest should not be able to view a private project
            response = yield helper.inject({
                method: 'GET',
                url: helper.apiRoute + '/projects/0/boards/1/lists/4/tasks/13'
            });
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow invalid inputs for retrieving task', function(done) {
        co(function* () {
            let url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks/{id}?token={token}';
            let payload = {
                method: 'GET'
            };
            // Check admin retrievals
            let admin = yield helper.login(helper.userSeeds[0]);
            // Task does not exist
            let response = yield helper.inject(payload, null, url, {pid: 0, bid: 0, lid: 0, id: 1000, token: admin});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // List does not match
            response = yield helper.inject(payload, null, url, {pid: 0, bid: 0, lid: 1, id: 0, token: admin});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // List does not match public
            response = yield helper.inject(payload, null, url, {pid: 1, bid: 2, lid: 1, id: 18, token: admin});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Board does not match public
            response = yield helper.inject(payload, null, url, {pid: 1, bid: 1, lid: 6, id: 18, token: admin});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Project does not match public
            response = yield helper.inject(payload, null, url, {pid: 3, bid: 2, lid: 6, id: 18, token: admin});
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Check guest retrievals
            url = helper.apiRoute + '/projects/{pid}/boards/{bid}/lists/{lid}/tasks/{id}';
            payload = {
                method: 'GET'
            };
            // Task does not exist
            response = yield helper.inject(payload, null, url, {pid: 0, bid: 0, lid: 0, id: 1000});
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            // List does not match
            response = yield helper.inject(payload, null, url, {pid: 0, bid: 0, lid: 1, id: 0});
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            // List does not match public
            response = yield helper.inject(payload, null, url, {pid: 1, bid: 2, lid: 1, id: 18});
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            // Board does not match public
            response = yield helper.inject(payload, null, url, {pid: 1, bid: 1, lid: 6, id: 18});
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            // Project does not match public
            response = yield helper.inject(payload, null, url, {pid: 3, bid: 2, lid: 6, id: 18});
            assert.equal(response.statusCode, Helper.Status.unauthorized);

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