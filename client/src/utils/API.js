/**
 * Interacts with the API server.
 */
import request from 'reqwest';
import AuthStore from '../stores/AuthStore';

var baseURL = 'http://mwtest.xyz:8080/api';
var contentType = 'application/x-www-form-urlencoded';

var API = {
    /**
     * Routes to interact with the API server.
     */
    routes: {
        url: baseURL,
        user: baseURL + '/user',
        register: baseURL + '/user/register',
        login: baseURL + '/user/login',
        taskCreate: baseURL + '/task/create',
        taskUpdateTitle: baseURL + '/task/update/title',
        taskUpdatePosition: baseURL + '/task/update/position',
        taskDelete: baseURL + '/task/delete'
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
                if (error) error(err);
            }
        });
    },

    /**
     * Posts an action to the given URL.
     * @param {String} url the url to post to.
     * @param {*} data the JSON data to post.
     * @param {Function<*>?} success the success callback with the data retrieved.
     * @param {Function<Error>?} error the error callback with the error.
     */
    doAuthActionTo: function(url, data, success, error) {
        if (!AuthStore.isLoggedIn()) {
            if (error) error(new Error('Not logged in'));
            return;
        }


        request({
            url: url + '?token=' + AuthStore.getJWT(),
            //url: url,
            method: 'POST',
            contentType: contentType,
            crossOrigin: true,
            data: data,
            success: success,
            error: error
        })
    }
};

export default API;