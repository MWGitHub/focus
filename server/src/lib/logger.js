var bunyan = require('bunyan');
var config = require('../../config.json');

/**
 * @type {Logger}
 */
var log = bunyan.createLogger({
    name: 'focus'
});
log.level(config.logLevel);

/**
 * The singleton logger
 * @type {Logger}
 */
module.exports = log;