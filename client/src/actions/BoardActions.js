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
                Dispatcher.dispatch({
                    actionType: Actions.retrieveUser,
                    state: Actions.State.failed
                });
            }
        )
    },

    forceUserUpdate: function() {
        Dispatcher.dispatch({
            actionType: Actions.updateUser,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.routes.updateUser, {force: true},
            (data) => {
                Dispatcher.dispatch({
                    actionType: Actions.updateUser,
                    state: Actions.State.complete,
                    data: data
                });
                this.retrieveData();
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.updateUser,
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
                list_id: list,
                title: title,
                position: position
            },
            (resp) => {
                Dispatcher.dispatch({
                    actionType: Actions.createTask,
                    state: Actions.State.complete,
                    list: list,
                    title: title
                });
                this.retrieveData();
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.createTask,
                    state: Actions.State.failed
                });
            }
        )
    },

    deleteTask: function(id) {
        Dispatcher.dispatch({
            actionType: Actions.deleteTask,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.routes.taskDelete, {
                id: id
            },
            (resp) => {
                Dispatcher.dispatch({
                    actionType: Actions.deleteTask,
                    state: Actions.State.complete,
                    id: id
                });
                this.retrieveData();
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.deleteTask,
                    state: Actions.State.failed
                });
            }
        )
    },

    moveTask: function(id, list, position) {
        Dispatcher.dispatch({
            actionType: Actions.moveTask,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.routes.taskUpdatePosition, {
                id: id,
                list_id: list,
                position: position
            },
            (resp) => {
                Dispatcher.dispatch({
                    actionType: Actions.moveTask,
                    state: Actions.State.complete,
                    list: list,
                    id: id,
                    position: position
                });
                this.retrieveData();
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.moveTask,
                    state: Actions.State.failed
                });
            }
        )
    }
};

export default BoardActions;