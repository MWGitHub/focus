// Helper functions for generating requests and routes.
var User = require('../models/user');
var Board = require('../models/board');
var List = require('../models/list');
var Task = require('../models/task');

/**
 * Route to append for the API.
 * @type {string}
 */
module.exports.route = '/api';

/**
 * Creates a JSON status message.
 * @param {String} action the action of the request.
 * @param {Boolean} success true if successful.
 * @param {String} message the message to give.
 * @returns {{meta: {action: String, success: Boolean, message: String}}}
 */
module.exports.makeStatusMessage = function(action, success, message) {
    "use strict";

    return {
        meta: {
            action: action,
            success: success,
            message: message
        }
    }
};

/**
 * Creates a JSON data message.
 * @param {*} data the data to send, must be valid JSON.
 * @returns {{data: *}} the data to give.
 */
module.exports.makeData = function(data) {
    "use strict";

    return {
        data: data
    };
};

/**
 * Populates a user with the default board and lists.
 * @param {String} username the username to populate for.
 * @returns {*} the promise when generation is complete.
 */
module.exports.populateUser = function(username) {
    "use strict";

    var uid;
    return User.forge({username: username}).fetch()
        .then(function(user) {
            uid = user.get('id');
            // Create the main board
            return Board.forge({
                title: 'Main',
                user_id: uid
            }).save();
        })
        .then(function(board) {
            // Create the lists
            var id = board.get('id');
            return Promise.all([
                List.forge({
                    title: 'Tasks',
                    board_id: id,
                    user_id: uid
                }).save(),
                List.forge({
                    title: 'Tomorrow',
                    board_id: id,
                    user_id: uid
                }).save(),
                List.forge({
                    title: 'Today',
                    board_id: id,
                    user_id: uid
                }).save(),
                List.forge({
                    title: 'Done',
                    board_id: id,
                    user_id: uid
                }).save()
            ]);
        });
};

module.exports.destroyUser = function(username) {
    "use strict";

};