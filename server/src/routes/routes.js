var BoardRoutes = require('./board');
var StaleRoutes = require('./stale');

var routes = {
    addRoutes: function(server) {
        server.route(BoardRoutes);
        server.route(StaleRoutes);
    }
};

module.exports = routes;

