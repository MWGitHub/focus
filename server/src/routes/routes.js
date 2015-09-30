var BoardRoutes = require('./board');
var ListRoutes = require('./list');
var StaleRoutes = require('./stale');

var routes = {
    addRoutes: function(server) {
        server.route(BoardRoutes);
        server.route(ListRoutes);
        server.route(StaleRoutes);
    }
};

module.exports = routes;

