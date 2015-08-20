var Route = require('../routes/task');

var task = {
    register: function(server, options, next) {
        "use strict";

        server.route(Route);
        next();
    }
};

task.register.attributes = {
    name: 'task',
    version: '1.0.0'
};

module.exports = task;