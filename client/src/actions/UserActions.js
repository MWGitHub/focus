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
    }
};

export default UserActions;