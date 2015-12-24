var assert = require('chai').assert;
var Helper = require('./helpers/helper');
var co = require('co');
var _ = require('lodash');

describe('permission', function() {
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

    it('should allow permission creation', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var viewer = helper.userSeeds[1];
            var viewerToken = (yield helper.login(viewer.username, viewer.password)).result.data.token;
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/0',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[1].id,
                    role: "admin"
                }
            };

            // Try to update title before user is changed to admin
            var viewPayload = {
                method: 'POST',
                url: helper.apiRoute + '/projects/0/update',
                headers: {
                    authorization: viewerToken
                },
                payload: {
                    title: 'switched'
                }
            };
            var response = yield helper.inject(viewPayload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Set user to admin
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);

            // Have new admin user update title
            response = yield helper.inject(viewPayload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.attributes.title, 'switched');

            /*
            // Set user to viewer
            var clone = _.cloneDeep(payload);
            clone.payload.role = 'viewer';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.valid);

            // Try and fail to update title as viewer
            response = yield helper.inject(viewPayload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Be able to view the project
            viewPayload = {
                method: 'GET',
                url: helper.apiRoute + '/projects/0?token=' + viewerToken
            };
            response = yield helper.inject(viewPayload);
            assert.equal(response.statusCode, Helper.Status.valid);
            */

            done();
        }).catch(function(e) {
            done(e);
        });
    });

    it('should not allow unauthorized users from setting permissions', function(done) {
        co(function* () {
            // Members should not be allowed to add permissions for public projects
            var user = helper.userSeeds[1];
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[4].id,
                    role: "admin"
                }
            };

            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Members should not be allowed to add permissions for private projects
            var clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/permissions/projects/2';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewers should not be allowed to add permissions for public projects
            user = helper.userSeeds[2];
            token = (yield helper.login(user.username, user.password)).result.data.token;
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/3',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[4].id,
                    role: "admin"
                }
            };

            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Viewers should not be allowed to add permissions for private projects
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/permissions/projects/2';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Unauthorized users should not be able to add permissions for public projects
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1',
                payload: {
                    user_id: helper.userSeeds[4].id,
                    role: "admin"
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            // Unauthorized users should not be allowed to add permissions for private projects
            clone = _.cloneDeep(payload);
            clone.url = helper.apiRoute + '/permissions/projects/2';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.unauthorized);


            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should not allow invalid inputs', function(done) {
        co(function* () {
            // A user with permissions should not be able to have another permission for the same project
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[1].id,
                    role: "admin"
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.error);

            // Check for invalid inputs
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[4].id,
                    role: "admin"
                }
            };

            // User ID must be given
            var clone = _.cloneDeep(payload);
            delete clone.payload.user_id;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Role must be given
            clone = _.cloneDeep(payload);
            delete clone.payload.role;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // User ID with id that does not exist
            clone = _.cloneDeep(payload);
            clone.payload.user_id = 1892731;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.internal);

            // User ID must be an integer
            clone = _.cloneDeep(payload);
            clone.payload.user_id = 'pug';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Role must be in the role list
            clone = _.cloneDeep(payload);
            clone.payload.role = 'pug';
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should list all users with permission', function(done) {
        co(function* () {
            // Retrieve permissions as an admin
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/permissions/projects/0?token=' + token
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.length, 1);

            // Add a member and retrieve permissions
            yield helper.inject({
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/0',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[1].id,
                    role: "member"
                }
            });

            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.length, 2);

            // Add a viewer and retrieve permissions
            yield helper.inject({
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/0',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[2].id,
                    role: "viewer"
                }
            });

            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.length, 3);

            // Retrieve permissions of a public project
            response = yield helper.inject({
                method: 'GET',
                url: helper.apiRoute + '/permissions/projects/1'
            });
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.length, 2);

            // Retrieve permissions of a public project as an admin
            response = yield helper.inject({
                method: 'GET',
                url: helper.apiRoute + '/permissions/projects/1?token=' + token
            });
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.length, 2);

            // Retrieve permissions as a member
            user = helper.userSeeds[1];
            token = (yield helper.login(user.username, user.password)).result.data.token;
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/permissions/projects/2?token=' + token
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.length, 3);

            // Retrieve permissions as a viewer
            user = helper.userSeeds[2];
            token = (yield helper.login(user.username, user.password)).result.data.token;
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/permissions/projects/4?token=' + token
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);
            assert.equal(response.result.data.length, 1);

            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should not allow listing users for private boards not a member of', function(done) {
        co(function* () {
            // Should not allow listings for forbidden private boards
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var payload = {
                method: 'GET',
                url: helper.apiRoute + '/permissions/projects/4?token=' + token
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Should not allow listings for unauthorized private boards
            payload = {
                method: 'GET',
                url: helper.apiRoute + '/permissions/projects/4'
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should update permissions of a user', function(done) {
        co(function* () {
            // Should change a user to admin
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            var changed = helper.userSeeds[1];
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1/update',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: changed.id,
                    role: 'admin'
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.valid);

            // Have changed user add a member
            token = (yield helper.login(changed.username, changed.password)).result.data.token;
            response = yield helper.inject({
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[4].id,
                    role: "member"
                }
            });
            assert.equal(response.statusCode, Helper.Status.valid);

            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should prevent an admin from demoting if they are the only one', function(done) {
        co(function* () {
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;

            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1/update',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: user.id,
                    role: 'member'
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.error);
            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should not allow non admins to update permissions of a user', function(done) {
        co(function* () {
            // Should not allow members from updating
            var user = helper.userSeeds[1];
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1/update',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[0].id,
                    role: 'member'
                }
            };
            var response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Should not allow viewers from updating
            user = helper.userSeeds[2];
            token = (yield helper.login(user.username, user.password)).result.data.token;
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/2/update',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[1].id,
                    role: 'member'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.forbidden);

            // Should not allow unauthorized from updating
            payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/2/update',
                payload: {
                    user_id: helper.userSeeds[1].id,
                    role: 'member'
                }
            };
            response = yield helper.inject(payload);
            assert.equal(response.statusCode, Helper.Status.unauthorized);

            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should not allow invalid updates', function(done) {
        co(function* () {
            // Should not allow invalid roles
            var user = helper.userSeeds[0];
            var token = (yield helper.login(user.username, user.password)).result.data.token;
            var payload = {
                method: 'POST',
                url: helper.apiRoute + '/permissions/projects/1/update',
                headers: {
                    authorization: token
                },
                payload: {
                    user_id: helper.userSeeds[1].id,
                    role: 'member'
                }
            };

            var clone = _.cloneDeep(payload);
            clone.payload.role = 'invalid';
            var response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            // Should not allow invalid users
            clone = _.cloneDeep(payload);
            clone.payload.user_id = 13578135;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.internal);

            // Should not allow missing parameters
            clone = _.cloneDeep(payload);
            delete clone.payload.user_id;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            clone = _.cloneDeep(payload);
            delete clone.payload.role;
            response = yield helper.inject(clone);
            assert.equal(response.statusCode, Helper.Status.error);

            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should delete a permission', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should not an unauthorized deletion', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        })
    });

    it('should not allow invalid inputs', function(done) {
        co(function* () {
            assert(false);
            done();
        }).catch(function(e) {
            done(e);
        })
    });
});