// Helper functions for generating requests and routes.
var User = require('../models/user');
var Board = require('../models/board');
var List = require('../models/list');
var Task = require('../models/task');
var moment = require('moment-timezone');
var config = require('../../config.json');

/**
 * Route to append for the API.
 * @type {string}
 */
module.exports.route = '/api/v1';

/**
 * Default time zone.
 * @type {string}
 */
module.exports.defaultTimeZone = config.defaultTimeZone;

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
 * @param {User} user the user to populate.
 * @returns {*} the promise when generation is complete.
 */
module.exports.populateUser = function(user) {
    "use strict";

    var uid = user.get('id');
    return Board.forge({
                title: 'Main',
                user_id: uid
    }).save()
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

/**
 * Checks and updates the tasks of the given user if needed.
 * @param {User} user the username to update the tasks for.
 * @param {Boolean?} force true to force the update.
 */
module.exports.updateUserTasks = function(user, force) {
    var self = this;
    var lastUpdate = user.get('lastupdate');
    var shouldUpdate = false;
    var tz = user.get('timezone');
    moment.tz.setDefault(tz);
    // Number of times to update
    var times = 0;
    // Update if never updated before
    if (!lastUpdate || force) {
        shouldUpdate = true;
        times = 1;
    } else {
        // Check if midnight for the user has passed and if the user has updated
        // Set the default time zone to the user time zone while doing the operation
        try {
            var now = moment();
            var midnightString = now.year() + '-' + (now.month() + 1) + '-' + now.date();
            var midnight = moment(midnightString, 'YYYY-MM-DD');
            var updateTime = moment(lastUpdate);
            var difference = midnight - updateTime;

            // Check if the last update is before midnight, if before update all tasks
            shouldUpdate = difference > 0;
        } catch(e) {
            // Set the time zone back to the default
            moment.tz.setDefault(this.defaultTimeZone);
            shouldUpdate = false;
            throw e;
        }
    }

    if (shouldUpdate) {
        var uid = user.get('id');
        var todayList;
        return List.forge({user_id: uid, title: 'Today'}).fetch({require: true})
            // Update incomplete tasks by one age
            .then(function (list) {
                todayList = list;
                return Task.where({list_id: list.get('id')}).fetchAll();
            })
            .then(function(tasks) {
                return tasks.mapThen(function(model) {
                    return model.set('age', model.get('age') + 1).save().then();
                });
            })
            // Move all of tomorrow's task to today
            .then(function() {
                return List.forge({user_id: uid, title: 'Tomorrow'}).fetch({require: true});
            })
            .then(function (list) {
                return Task.where({list_id: list.get('id')}).fetchAll();
            })
            .then(function(tasks) {
                return tasks.mapThen(function(model) {
                    return model.set('list_id', todayList.get('id')).save().then();
                });
            })
            // Reset the time zone default
            .then(function() {
                var time = moment().format('YYYY-MM-DD HH:mm:ss.SSSZZ');
                return user.set('lastupdate', time).save();
            })
            .then(function() {
                // Set the time zone back to the default
                moment.tz.setDefault(self.defaultTimeZone);
            })
            .catch(function (err) {
                moment.tz.setDefault(self.defaultTimeZone);
                throw err;
            })
    } else {
        // Set the time zone back to the default
        moment.tz.setDefault(this.defaultTimeZone);
        return Promise.resolve(true);
    }
};