var UserRoutes = require('./user');
var BoardRoutes = require('./board');
var ListRoutes = require('./list');
var TaskRoutes = require('./task');
var StaleRoutes = require('./stale');

var routes = {
    addRoutes: function(server) {
        server.route(UserRoutes);
        server.route(BoardRoutes);
        server.route(ListRoutes);
        server.route(TaskRoutes);
        server.route(StaleRoutes);
    }
};

module.exports = routes;

