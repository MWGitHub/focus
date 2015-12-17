var assert = require('chai').assert;
var Helper = require('./helpers/helper');
var co = require('co');
var moment = require('moment-timezone');
var _ = require('lodash');

describe('project', function() {
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

    it('should create a project and set admin on creator', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            // Test with only title given
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects',
                headers: {
                    authorization: token
                },
                payload: {
                    title: 'test-project'
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'test-project');
            assert.equal(response.result.data.attributes.is_public, false);

            // Test with title and public given
            var clone = _.cloneDeep(payload);
            clone.payload.is_public = true;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'test-project');
            assert.equal(response.result.data.attributes.is_public, true);

            // Test with public given as false
            clone = _.cloneDeep(payload);
            clone.payload.is_public = false;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'test-project');
            assert.equal(response.result.data.attributes.is_public, false);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not create an invalid project', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            // Test with title too short
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects',
                headers: {
                    authorization: token
                },
                payload: {
                    title: ''
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.error);

            // Test with title too long
            var clone = _.cloneDeep(payload);
            clone.payload.title = _.pad('', 1000, 'a');
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Public flag invalid
            clone = _.cloneDeep(payload);
            clone.payload.is_public = 'yes';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Should not be allowed to create a project when not logged in
            response = yield helper.inject({
                method: 'POST',
                url: helper.apiRoute + '/projects',
                payload: {
                    title: 'valid'
                }
            });
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should update the project', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/update',
                headers: {
                    authorization: token
                },
                payload: {
                }
            };

            // Change title of project
            var clone = _.cloneDeep(payload);
            clone.payload.title = 'test-project';
            var response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'test-project');
            assert.equal(response.result.data.attributes.is_public, false);

            // Change the public flag
            clone = _.cloneDeep(payload);
            clone.payload.is_public = true;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'test-project');
            assert.equal(response.result.data.attributes.is_public, true);

            // Change the title again
            clone = _.cloneDeep(payload);
            clone.payload.title = 'test-project-again';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'test-project-again');
            assert.equal(response.result.data.attributes.is_public, true);

            // Change the public flag back to false
            clone = _.cloneDeep(payload);
            clone.payload.is_public = false;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'test-project-again');
            assert.equal(response.result.data.attributes.is_public, false);

            // Change both the title and public flag
            clone = _.cloneDeep(payload);
            clone.payload.title = 'another';
            clone.payload.is_public = true;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'another');
            assert.equal(response.result.data.attributes.is_public, true);

            // No payload given should do nothing
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'another');
            assert.equal(response.result.data.attributes.is_public, true);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should disallow invalid updates', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/update',
                headers: {
                    authorization: token
                },
                payload: {
                }
            };

            // Change title of the project to be too long
            var clone = _.cloneDeep(payload);
            clone.payload.title = _.pad('', 1000, 'a');
            var response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Change title of the project to be too short
            clone = _.cloneDeep(payload);
            clone.payload.title = '';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Change flag of the project to be invalid
            clone = _.cloneDeep(payload);
            clone.payload.is_public = 'wrong';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Change both parameters to be invalid
            clone = _.cloneDeep(payload);
            clone.payload.title = '';
            clone.payload.is_public = 'wrong';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should disallow updating project title of non-admins', function(done) {
        co(function* () {
            var user = helper.userSeeds[1];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/1/update',
                headers: {
                    authorization: token
                },
                payload: {
                }
            };

            // Members should not be able to change public project properties
            var clone = _.cloneDeep(payload);
            clone.payload.title = 'another';
            var response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Members should not be able to change private project properties
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/2/update';
            clone.payload.title = 'another';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // No relation should not be able to change private project properties
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/0/update';
            clone.payload.title = 'another';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // No relation should not be able to change public project properties
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/4/update';
            clone.payload.title = 'another';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to change private project properties
            user = helper.userSeeds[2];
            token = (yield helper.login(user.username, user.password)).result.data.token;
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/2/update',
                headers: {
                    authorization: token
                },
                payload: {
                }
            };

            clone = _.cloneDeep(payload);
            clone.payload.title = 'another';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewer should not be able to change public project properties
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/3/update';
            clone.payload.title = 'another';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should allow viewing of projects for valid users', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/0?token=' + token
            };

            // Admin should be able to view the project
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.id, 0);
            assert.equal(response.result.data.attributes.title, 'title0');

            // Anyone logged in should be able to view public projects
            var clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/3?token=' + token;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.id, 3);
            assert.equal(response.result.data.attributes.title, 'title3');

            // Anyone should be able to view public projects
            response = yield helper.inject({
                method: 'GET',
                url: helper.apiRoute + '/projects/1'
            });
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.id, 1);
            assert.equal(response.result.data.attributes.title, 'title1');

            // Members should be able to view projects
            user = helper.userSeeds[1];
            token = (yield helper.login(user.username, user.password)).result.data.token;
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/1?token=' + token,
                headers: {
                    authorization: token
                }
            };

            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.id, 1);
            assert.equal(response.result.data.attributes.title, 'title1');

            // Members should be able to view private projects
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/2?token=' + token;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.id, 2);
            assert.equal(response.result.data.attributes.title, 'title2');

            // Viewer should be able to view projects
            user = helper.userSeeds[2];
            token = (yield helper.login(user.username, user.password)).result.data.token;
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/3?token=' + token,
                headers: {
                    authorization: token
                }
            };

            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.id, 3);
            assert.equal(response.result.data.attributes.title, 'title3');

            // Members should be able to view private projects
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/projects/4?token=' + token;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.id, 4);
            assert.equal(response.result.data.attributes.title, 'title4');

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow viewing of private projects to users without access', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/4?token=' + token
            };

            // Should not be able to view private projects without permission
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Users that are not logged in should not be able to view private projects
            response = yield helper.inject({
                method: 'GET',
                url: helper.apiRoute + '/projects/4'
            });
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should allow admins to delete projects', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow non-admins to delete projects', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });
});