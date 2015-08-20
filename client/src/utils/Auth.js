/**
 * Handles authentication to the server.
 */
import API from './api';
import request from 'reqwest';

var Auth = {
    /**
     * Attemps to log in to the server and provides the token when successful.
     * @param {String} username the username to log in with.
     * @param {String} password the password to log in with.
     * @param {Function<String>?} success the callback function with the token when logged in.
     * @param {Function<Error>?} error the callback function on error.
     */
    login: function(username, password, success, error) {
        request({
            url: API.login,
            method: 'post',
            contentType: 'application/x-www-form-urlencoded',
            crossOrigin: true,
            data: {
                username: username,
                password: password
            },
            success: function(resp) {
                if (success) success(resp.meta.message);
            },
            error: function(err) {
                if (error) error(err);
            }
        });
    }
};

export default Auth;