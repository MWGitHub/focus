import API from '../utils/API';
import Dispatcher from '../utils/Dispatcher';
import request from 'reqwest';
import Actions from '../constants/Actions';

var UserActions = {
    /**
     * Retrieves the data for the user.
     * @param {Boolean} isDeep true to retrieve relation data.
     */
    retrieve: function(uid, isDeep) {
        Dispatcher.dispatch({
            actionType: Actions.retrieveUser,
            state: Actions.State.loading
        });
        var data = {};
        if (isDeep) data.isDeep = isDeep;
        API.retrieveAuthDataFrom(API.routes.user + '/' + uid, data,
            (data) => {
                Dispatcher.dispatch({
                    actionType: Actions.retrieveUser,
                    state: Actions.State.complete,
                    data: data
                });
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.retrieveUser,
                    state: Actions.State.failed
                });
            }
        )
    },

    retrieveData: function(uid, isDeep) {
        Dispatcher.dispatch({
            actionType: Actions.retrieveUser,
            state: Actions.State.loading
        });
        var data = {};
        if (isDeep) data.isDeep = isDeep;
        API.retrieveAuthDataFrom(API.routes.user + '/' + uid, data,
            (data) => {
                Dispatcher.dispatch({
                    actionType: Actions.retrieveUser,
                    state: Actions.State.complete,
                    data: data
                });
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.retrieveUser,
                    state: Actions.State.failed
                });
            }
        )
    },

    update: function(uid, password, timezone, success, error) {
        Dispatcher.dispatch({
            actionType: Actions.updateUser,
            state: Actions.State.loading,
            password: password,
            timezone: timezone
        });

        var data = {};
        if (password) {
            data.password = password;
        }
        if (timezone) {
            data.timezone = timezone;
        }
        API.doAuthActionTo(API.parseRoute(API.routes.updateUser, {id: uid}), API.methods.post, data,
            (result) => {
                Dispatcher.dispatch({
                    actionType: Actions.updateUser,
                    state: Actions.State.complete
                });
                if (success) success(result);
            },
            (err) => {
                Dispatcher.dispatch({
                    actionType: Actions.updateUser,
                    state: Actions.State.failed
                });
                if (error) error(err);
            });
    }
};

export default UserActions;