var Server = require('./src/server');
var Config = require('./config.json');

var server = new Server(Config);
server.start().then();