import Dispatcher from '../utils/Dispatcher';
import Actions from '../constants/Actions';
import request from 'reqwest';
import API from '../utils/API';
import Auth from '../utils/Auth';

var LoginActions = {
    /**
     * Logs in to the service.
     * @param {String} username the username to log in with.
     * @param {String} password the password to log in with.
     * @param {Function<Error>?} onError callback that runs if an error occurs.
     */
    login: function(username, password, onError) {
        "use strict";

        Dispatcher.dispatch({
            actionType: Actions.login,
            state: Actions.State.loading,
            username: username,
            password: password
        });

        Auth.login(username, password,
            (jwt) => {
                Dispatcher.dispatch({
                    actionType: Actions.login,
                    state: Actions.State.complete,
                    jwt: jwt
                });
            },
            (err) => {
                Dispatcher.dispatch({
                    actionType: Actions.login,
                    state: Actions.State.failed
                });
                if (onError) {
                    onError(err);
                }
            });
    },

    logout: function() {
        Dispatcher.dispatch({
            actionType: Actions.logout
        });
    }
};

export default LoginActions;