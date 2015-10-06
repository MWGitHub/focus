var UserRoutes = require('./user');
var BoardRoutes = require('./board');
var ListRoutes = require('./list');
var TaskRoutes = require('./task');
var StaleRoutes = require('./stale');
var PermissionRoutes = require('../permission/permission-route');

var routes = {
    addRoutes: function(server) {
        server.route(UserRoutes);
        server.route(BoardRoutes);
        server.route(ListRoutes);
        server.route(TaskRoutes);
        server.route(StaleRoutes);
        server.route(PermissionRoutes);
    }
};

module.exports = routes;

