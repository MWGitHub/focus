import API from '../utils/API';
import Dispatcher from '../utils/Dispatcher';
import request from 'reqwest';
import Actions from '../constants/Actions';

var BoardActions = {
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

    forceUserUpdate: function(uid) {
        Dispatcher.dispatch({
            actionType: Actions.updateUser,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.routes.updateUser, API.methods.post, {force: true},
            (data) => {
                Dispatcher.dispatch({
                    actionType: Actions.updateUser,
                    state: Actions.State.complete,
                    data: data
                });
                this.retrieveData(uid);
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.updateUser,
                    state: Actions.State.failed
                });
            }
        )
    },

    createTask: function(uid, list, title, position) {
        Dispatcher.dispatch({
            actionType: Actions.createTask,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.routes.taskCreate, API.methods.post, {
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
                this.retrieveData(uid);
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.createTask,
                    state: Actions.State.failed
                });
            }
        )
    },

    deleteTask: function(uid, id) {
        Dispatcher.dispatch({
            actionType: Actions.deleteTask,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.parseRoute(API.routes.taskDelete, {id: id}), API.methods.post, null,
            (resp) => {
                Dispatcher.dispatch({
                    actionType: Actions.deleteTask,
                    state: Actions.State.complete,
                    id: id
                });
                this.retrieveData(uid);
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.deleteTask,
                    state: Actions.State.failed
                });
            }
        )
    },

    moveTask: function(uid, id, list, position) {
        Dispatcher.dispatch({
            actionType: Actions.moveTask,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.routes.taskUpdatePosition, API.methods.post, {
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
                this.retrieveData(uid);
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