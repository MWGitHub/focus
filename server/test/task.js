var assert = require('chai').assert;
var Lab = require('lab');
var User = require('../src/models/user');
var List = require('../src/models/list');
var Task = require('../src/models/task');
var Auth = require('../src/auth/auth');
var Session = require('../src/auth/session');
var API = require('../src/lib/api');
var Helper = require('./helpers/helper');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;

describe('task', function() {

});