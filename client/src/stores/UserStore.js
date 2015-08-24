/**
 * Stores all the user data.
 */
import BaseStore from './BaseStore';
import Actions from '../constants/Actions';
import StorageKeys from '../constants/StorageKeys';

var data = null;
class UserStore extends BaseStore {
    constructor() {
        super();

        BaseStore.subscribe(this._userActions.bind(this));
    }

    _userActions(action) {
        switch (action.actionType) {
            case Actions.retrieveUser:
                if (action.state === Actions.State.complete) {
                    data = action.data;
                    this.emitChange();
                } else if (action.state === Actions.State.failed) {
                    data = null;
                    this.emitChange();
                }
                break;
            case Actions.createTask:
                if (action.state === Actions.State.complete) {
                    this.emitChange();
                } else if (action.state === Actions.State.failed) {
                    data = null;
                    this.emitChange();
                }
                break;
            case Actions.deleteTask:
                if (action.state === Actions.State.complete) {
                    this.emitChange();
                } else if (action.state === Actions.State.failed) {
                    data = null;
                    this.emitChange();
                }
                break;
        }
    }

    getData() {
        return data;
    }
}

export default new UserStore();