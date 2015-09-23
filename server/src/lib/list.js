var Route = require('../routes/list');

var list = {
    register: function(server, options, next) {
        "use strict";

        server.route(Route);
        next();
    }
};

list.register.attributes = {
    name: 'list',
    version: '1.0.0'
};

module.exports = list;