import Dispatcher from '../utils/Dispatcher';
import Actions from '../constants/Actions';
import request from 'reqwest';
import API from '../utils/API';
import Auth from '../utils/Auth';

var RegisterActions = {
    register: function(username, password, tz, onError) {
        "use strict";

        Dispatcher.dispatch({
            actionType: Actions.register,
            state: Actions.State.loading,
            username: username,
            password: password
        });

        var data = {
            username: username,
            password: password
        };
        if (tz) {
            data.timezone = tz;
        }
        request({
            url: API.routes.register,
            method: 'post',
            contentType: 'application/x-www-form-urlencoded',
            crossOrigin: true,
            data: data,
            success: function(resp) {
                // Log in after registering.
                Auth.login(username, password, function(data) {
                    Dispatcher.dispatch({
                        actionType: Actions.register,
                        state: Actions.State.complete,
                        jwt: data.token
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