/**
 * Interacts with the API server.
 */

var baseURL = 'http://mwtest.xyz:8080/api';

var API = {
    url: baseURL,
    user: baseURL + '/user',
    register: baseURL + '/user/register',
    login: baseURL + '/user/login'
};

export default API;