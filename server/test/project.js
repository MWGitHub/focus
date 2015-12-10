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
            console.log(response);
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
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should update the project title', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should disallow updating project title of non-admins', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should allow viewing of projects for valid users', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow viewing of private projects to users without access', function(done) {
        co(function* () {
            assert(false);
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