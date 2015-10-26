/**
 * Stores all the user data.
 */
import BaseStore from './BaseStore';
import Actions from '../constants/Actions';

var data = null;
class UserStore extends BaseStore {
    constructor() {
        super();

        BaseStore.subscribe(this._userActions.bind(this));
    }

    _userActions(action) {
        var handled = true;
        switch (action.actionType) {
            case Actions.retrieveUser:
                if (action.state === Actions.State.complete) {
                    data = action.data.data;
                    this.emitChange();
                } else if (action.state === Actions.State.failed) {
                    data = null;
                    this.emitChange();
                }
                break;
            default:
                handled = false;
                break;
        }
        if (!handled && action.state !== Actions.State.loading) {
            this.emitChange();
        }
    }

    getData() {
        return data;
    }
}

export default new UserStore();