var Route = require('../routes/board');

var board = {
    register: function(server, options, next) {
        "use strict";

        server.route(Route);
        next();
    }
};

board.register.attributes = {
    name: 'board',
    version: '1.0.0'
};

module.exports = board;