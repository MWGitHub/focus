import API from '../utils/API';
import Dispatcher from '../utils/Dispatcher';
import request from 'reqwest';
import Actions from '../constants/Actions';

var UserActions = {
    retrieveData: function(uid) {
        Dispatcher.dispatch({
            actionType: Actions.retrieveUser,
            state: Actions.State.loading
        });
        API.retrieveAuthDataFrom(API.routes.user + '/' + uid,
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

        API.doAuthActionTo(API.parseRoute(API.routes.updateUser, {id: uid}), API.methods.post,
            {password: password, timezone: timezone},
            () => {
                Dispatcher.dispatch({
                    actionType: Actions.updateUser,
                    state: Actions.State.complete
                });
                if (success) success();
            },
            (e) => {
                Dispatcher.dispatch({
                    actionType: Actions.updateUser,
                    state: Actions.State.failed
                });
                if (error) error(e);
            });
    }
};

export default UserActions;