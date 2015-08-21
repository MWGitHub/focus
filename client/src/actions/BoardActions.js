import API from '../utils/API';
import Dispatcher from '../utils/Dispatcher';
import request from 'reqwest';
import Actions from '../constants/Actions';

var BoardActions = {
    retrieveData: function() {
        Dispatcher.dispatch({
            actionType: Actions.retrieveUser,
            state: Actions.State.loading
        });
        API.retrieveAuthDataFrom(API.routes.user,
            (data) => {
                Dispatcher.dispatch({
                    actionType: Actions.retrieveUser,
                    state: Actions.State.complete,
                    data: data
                });
            },
            (error) => {
                console.log(error);
                Dispatcher.dispatch({
                    actionType: Actions.retrieveUser,
                    state: Actions.State.failed
                });
            }
        )
    },

    createTask: function(list, title, position) {
        Dispatcher.dispatch({
            actionType: Actions.createTask,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.routes.taskCreate, {
                list: list,
                title: title
            },
            (resp) => {
                Dispatcher.dispatch({
                    actionType: Actions.createTask,
                    state: Actions.State.complete,
                    data: resp
                });
            },
            (error) => {
                console.log(error);
                Dispatcher.dispatch({
                    actionType: Actions.createTask,
                    state: Actions.State.failed
                });
            }
        )
    }
};

export default BoardActions;