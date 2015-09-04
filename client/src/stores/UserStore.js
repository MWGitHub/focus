/**
 * Stores all the user data.
 * TODO: Separate data into more stores for easier updating and retrieval
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
        var handled = true;
        switch (action.actionType) {
            case Actions.retrieveUser:
                if (action.state === Actions.State.complete) {
                    data = action.data.data;
                    // Sort the tasks
                    for (var i = 0; i < data.attributes.boards[0].attributes.lists.length; i++) {
                        data.attributes.boards[0].attributes.lists[i].attributes.tasks.sort(function(a, b) {
                            if (a.attributes.position > b.attributes.position) {
                                return 1;
                            } else if (a.attributes.position < b.attributes.position) {
                                return -1;
                            }
                            return 0;
                        });
                    }
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