/**
 * Interacts with the API server.
 */
import request from 'reqwest';
import AuthStore from '../stores/AuthStore';

var baseURL = 'http://mwtest.xyz:8080/api/v1';
var contentType = 'application/x-www-form-urlencoded';

var API = {
    methods: {
        get: 'GET',
        post: 'POST',
        del: 'DELETE',
        put: 'PUT',
        patch: 'PATCH'
    },

    status: {
        register: {
            usernameTaken: 440
        }
    },

    /**
     * Routes to interact with the API server.
     */
    routes: {
        url: baseURL,
        user: baseURL + '/users',
        register: baseURL + '/users',
        login: baseURL + '/users/login',
        updateUser: baseURL + '/users/update',
        taskCreate: baseURL + '/tasks',
        taskUpdateTitle: baseURL + '/tasks/update/title',
        taskUpdatePosition: baseURL + '/tasks/update/position',
        taskDelete: baseURL + '/tasks'
    },

    /**
     * Retrieves data that requires authentication from a given URL.
     * @param {String} url the URL to retrieve the data from.
     * @param {Function<*>?} success the success callback with the data retrieved.
     * @param {Function<Error>?} error the error callback with the error.
     */
    retrieveAuthDataFrom: function(url, success, error) {
        if (!AuthStore.isLoggedIn()) {
            if (error) error(new Error('Not logged in'));
            return;
        }

        request({
            url: url,
            method: 'GET',
            contentType: contentType,
            crossOrigin: true,
            data: {
                token: AuthStore.getJWT()
            },
            success: function(resp) {
                if (success) success(resp);
            },
            error: function(err) {
                AuthStore.deauthorize();
                if (error) error(err);
            }
        });
    },

    /**
     * Posts an action to the given URL.
     * @param {String} url the url to post to.
     * @param {String} method the method to use.
     * @param {*} data the JSON data to post.
     * @param {Function<*>?} success the success callback with the data retrieved.
     * @param {Function<Error>?} error the error callback with the error.
     */
    doAuthActionTo: function(url, method, data, success, error) {
        if (!AuthStore.isLoggedIn()) {
            if (error) error(new Error('Not logged in'));
            return;
        }

        request({
            url: url + '?token=' + AuthStore.getJWT(),
            method: method,
            contentType: contentType,
            crossOrigin: true,
            data: data,
            success: function(resp) {
                if (success) success(resp);
            },
            error: function(err) {
                AuthStore.deauthorize();
                if (error) error(err);
            }
        })
    }
};

export default API;