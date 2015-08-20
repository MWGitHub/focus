import Dispatcher from '../utils/dispatcher';
import Actions from '../constants/actions';
import request from 'reqwest';
import API from '../utils/api';
import Auth from '../utils/Auth';

var RegisterActions = {
    register: function(username, password, onError) {
        "use strict";

        Dispatcher.dispatch({
            actionType: Actions.register,
            state: Actions.State.loading,
            username: username,
            password: password
        });

        request({
            url: API.register,
            method: 'post',
            contentType: 'application/x-www-form-urlencoded',
            crossOrigin: true,
            data: {
                username: username,
                password: password
            },
            success: function(resp) {
                // Log in after registering.
                Auth.login(username, password, function(token) {
                    Dispatcher.dispatch({
                        actionType: Actions.register,
                        state: Actions.State.complete,
                        jwt: token
                    });
                }, function(err) {
                    Dispatcher.dispatch({
                        actionType: Actions.register,
                        state: Actions.State.failed
                    });
                    if (onError) {
                        onError(err);
                    }
                });
                /*
                Dispatcher.dispatch({
                    actionType: Actions.register,
                    state: Actions.State.complete,
                    username: username,
                    password: password
                });
                */
            },
            error: function(err) {
                Dispatcher.dispatch({
                    actionType: Actions.register,
                    state: Actions.State.failed
                });
                if (onError) {
                    onError(err);
                }
            }
        });
    }
};

export default RegisterActions;