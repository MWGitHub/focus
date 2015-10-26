var UserRoutes = require('./user');
var ProjectRoutes = require('./project');
var BoardRoutes = require('./board');
var ListRoutes = require('./list');
var TaskRoutes = require('./task');
var StaleRoutes = require('./stale');
var PermissionRoutes = require('../auth/permission-route');

var routes = {
    addRoutes: function(server) {
        server.route(UserRoutes);
        server.route(ProjectRoutes);
        server.route(BoardRoutes);
        server.route(ListRoutes);
        server.route(TaskRoutes);
        server.route(StaleRoutes);
        server.route(PermissionRoutes);
    }
};

module.exports = routes;

