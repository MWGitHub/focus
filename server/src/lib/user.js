var RouteUser = require('../routes/user');

var user = {
    register: function(server, options, next) {
        "use strict";

        server.route(RouteUser);
        next();
    }
};

user.register.attributes = {
    name: 'user',
    version: '1.0.0'
};

module.exports = user;