var Session = require('../../src/auth/session');
var assert = require('chai').assert;
var Hapi = require('hapi');
var redis = require('redis');

var RedisClient = require('../../src/lib/redis-client');

describe('session registration', function() {
    var validRedis = {
        register: RedisClient,
        options: {
            db: 0
        }
    };
    var validSession = {
        register: Session,
        options: {
            redis: {
                plugin: 'redis-client',
                key: 'client'
            },
            key: 'ABCD'
        }
    };

    it('should register the plugin properly with the dependencies', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 8080});
        var plugins = [validRedis, validSession];
        server.register(plugins, function(err) {
            assert.isUndefined(err);
            done();
        });
    });

    it('should register if a redis instance is given', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var client = redis.createClient();
        var plugins = [
            {
                register: Session,
                options: {
                    redis: client,
                    key: 'ABCD'
                }
            }
        ];
        server.register(plugins, function(err) {
            assert.isUndefined(err);
            done();
        });
    });

    it('should fail if no client is given', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var plugins = [validRedis,
            {
                register: Session,
                options: {
                    key: 'ABCD'
                }
            }
        ];
        server.register(plugins, function(err) {
            assert.isDefined(err);
            done();
        });
    });

    it('should fail if no client and no plugin is given', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var plugins = [validRedis,
            {
                register: Session,
                options: {
                    redis: {
                        key: 'client'
                    },
                    key: 'ABCD'
                }
            }
        ];
        server.register(plugins, function(err) {
            assert.isDefined(err);
            done();
        });
    });

    it('should fail if no client and no key is given', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var plugins = [validRedis,
            {
                register: Session,
                options: {
                    redis: {
                        plugin: 'redis-client'
                    },
                    key: 'ABCD'
                }
            }
        ];
        server.register(plugins, function(err) {
            assert.isDefined(err);
            done();
        });
    });

    it('should fail if no key is given', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var plugins = [
            validRedis,
            {
                register: Session,
                options: {
                    redis: {
                        plugin: 'redis-client',
                        key: 'client'
                    }
                }
            }
        ];
        server.register(plugins, function(err) {
            assert.isDefined(err);
            done();
        });
    });

    it('should fail if an invalid redis plugin is given', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var plugins = [
            validRedis,
            {
                register: Session,
                options: {
                    redis: {
                        plugin: 'invalid',
                        key: 'client'
                    },
                    key: 'ABCD'
                }
            }
        ];
        server.register(plugins, function(err) {
            assert.isDefined(err);
            done();
        });
    });

    it('should fail if an invalid redis client key is given', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var plugins = [
            validRedis,
            {
                register: Session,
                options: {
                    redis: {
                        plugin: 'redis-client',
                        key: 'invalid'
                    },
                    key: 'ABCD'
                }
            }
        ];
        server.register(plugins, function(err) {
            assert.isDefined(err);
            done();
        });
    });

    it('should set namespace and ttl if given', function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var client = redis.createClient();
        var plugins = [
            {
                register: Session,
                options: {
                    redis: client,
                    key: 'ABCD',
                    table: 'test:',
                    expiration: 12345
                }
            }
        ];
        server.register(plugins, function(err) {
            assert.equal(server.plugins.session.table, 'test:');
            assert.equal(server.plugins.session.expiration, 12345);
            done();
        });
    });
});

describe('session', function() {
    before(function(done) {
        var server = new Hapi.Server();
        server.connection({port: 80});
        var plugins = [
            {
                register: RedisClient,
                options: {
                    db: 0
                }
            },
            {
                register: Session,
                options: {
                    redis: {
                        plugin: 'redis-client',
                        key: 'client'
                    },
                    key: 'ABCD'
                }
            }
        ];
        server.register(plugins, function(err) {
            server.initialize(function(err) {
                done();
            });
        });
    });

    it('should fail to validate an unknown session', function(done) {
        Session.validate('123').then(function(v) {
            assert.notOk(v);
            done();
        });
    });

    it('should generate a token from an id', function(done) {
        var token = Session.generateToken(1);
        assert.ok(token);
        done();
    });

    it('should decode a token with an id', function(done) {
        var token = Session.generateToken(100);
        assert.ok(token);
        var decoded = Session.decodeToken(token);
        assert.equal(decoded.data.id, 100);
        done();
    });

    it('should log in and validate a session then log out and fail validation', function(done) {
        var id = 1;
        var token = Session.generateToken(id);
        var parsed = Session.decodeToken(token);
        Session.login(token).then(function() {
            return Session.validate(parsed.data.tid);
        })
        .then(function(v) {
            assert.ok(v);
            return Session.logout(parsed.data.tid);
        })
        .then(function() {
            return Session.validate(parsed.data.tid);
        })
        .then(function(v) {
            assert.notOk(v);
            done();
        });
    });

    it('should log in with a very short expiration then fail validation when expired', function(done) {
        var id = 1;
        var token = Session.generateToken(id);
        var parsed = Session.decodeToken(token);
        Session.login(token, 1).then(function() {
            setTimeout(function() {
                Session.validate(parsed.data.tid).then(function(v) {
                    assert.notOk(v);
                    done();
                });
            }, 1100);
        });
    });

    it('should throw an error when logging in with an invalid token', function(done) {
        try {
            Session.login('test-token').then(function () {
                throw new Error();
            });
        } catch(e) {
            done();
        }
    });


    it('should throw an error when using an invalid expiration', function(done) {
        var id = 1;
        var token = Session.generateToken(id);
        try {
            Session.login(token, 0.1).then(function () {
                throw new Error();
            });
        } catch(e) {
            done();
        }
    });
});