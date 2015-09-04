/**
 * Handles authentication to the server.
 */
import API from './API';
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
            url: API.routes.login,
            method: 'post',
            contentType: 'application/x-www-form-urlencoded',
            crossOrigin: true,
            data: {
                username: username,
                password: password
            },
            success: function(resp) {
                if (success) success(resp.data);
            },
            error: function(err) {
                if (error) error(err);
            }
        });
    },

    decodeJWT: function(token) {
        var segments = token.split('.');
        return {
            info: JSON.parse(window.atob(segments[0])),
            data: JSON.parse(window.atob(segments[1]))
        };
    }
};

export default Auth;