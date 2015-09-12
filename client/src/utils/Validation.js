/**
 * Validates fields and returns an error message if exists.
 */

var Internal = {};

Internal.required = function(v) {
    if (!v) return 'is required';
    return null;
};

Internal.stringMinMax = function(v, min, max) {
    if (v.length < min) return 'must be at least ' + min + ' characters';
    if (v.length > max) return 'must not be longer than ' + max + ' characters';
    return null;
};

var Validation = {};

Validation.Rules = {
    Username: {
        min: 3,
        max: 20
    },
    Password: {
        min: 6,
        max: 100
    },
    Task: {
        min: 1,
        max: 30
    }
};

/**
 * Validates a username.
 * @param v the value to validate.
 * @returns {String|null} the error message or null if valid.
 */
Validation.username = function(v) {
    var message = Internal.required(v);
    if (message) return message;

    message = Internal.stringMinMax(v, Validation.Rules.Username.min, Validation.Rules.Username.max);
    if (message) return message;

    var match = v.match(/^\w+$/g);
    if (!match || match.length > 1) return 'must only use alphanumeric and _ characters';

    return null;
};

/**
 * Validates a password.
 * @param v the value to validate.
 * @returns {String|null} the error message or null if valid.
 */
Validation.password = function(v) {
    var message = Internal.required(v);
    if (message) return message;

    message = Internal.stringMinMax(v, Validation.Rules.Password.min, Validation.Rules.Password.max);
    if (message) return message;

    return null;
};

Validation.task = function(v) {
    var message = Internal.required(v);
    if (message) return message;

    message = Internal.stringMinMax(v, Validation.Rules.Task.min, Validation.Rules.Task.max);
    if (message) return message;

    return null;
};


export default Validation;