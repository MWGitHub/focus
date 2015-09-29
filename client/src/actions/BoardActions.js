import API from '../utils/API';
import Dispatcher from '../utils/Dispatcher';
import request from 'reqwest';
import Actions from '../constants/Actions';
import UserActions from './UserActions';

var BoardActions = {
    forceUserUpdate: function(uid) {
        Dispatcher.dispatch({
            actionType: Actions.ageUser,
            state: Actions.State.loading
        });
        API.doAuthActionTo(API.routes.ageUser, API.methods.post, {force: true},
            (data) => {
                Dispatcher.dispatch({
                    actionType: Actions.ageUser,
                    state: Actions.State.complete,
                    data: data
                });
                UserActions.retrieveData(uid);
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.ageUser,
                    state: Actions.State.failed
                });
            }
        )
    },

    createTask: function(uid, list, title, position, extra) {
        Dispatcher.dispatch({
            actionType: Actions.createTask,
            state: Actions.State.loading
        });
        var data = {
            list_id: list,
            title: title,
            position: position
        };
        if (extra) {
            data.extra = extra;
        }
        API.doAuthActionTo(API.routes.taskCreate, API.methods.post, data,
            (resp) => {
                Dispatcher.dispatch({
                    actionType: Actions.createTask,
                    state: Actions.State.complete,
                    list: list,
                    title: title
                });
                UserActions.retrieveData(uid);
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
                UserActions.retrieveData(uid);
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
        API.doAuthActionTo(API.parseRoute(API.routes.taskUpdatePosition, {id: id}), API.methods.post, {
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
                UserActions.retrieveData(uid);
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.moveTask,
                    state: Actions.State.failed
                });
            }
        )
    },

    checkStaleness: function(boardId) {
        Dispatcher.dispatch({
            actionType: Actions.checkStaleness,
            state: Actions.State.loading
        });
        API.retrieveAuthDataFrom(API.parseRoute(API.routes.getStaleness, {id: boardId}),
            (resp) => {
                Dispatcher.dispatch({
                    actionType: Actions.checkStaleness,
                    state: Actions.State.complete,
                    staleness: resp.data.staleness,
                    boardId: boardId
                });
            },
            (error) => {
                Dispatcher.dispatch({
                    actionType: Actions.checkStaleness,
                    state: Actions.State.failed
                })
            });
    }
};

export default BoardActions;