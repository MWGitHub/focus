/**
 * Stores the user data and authentication data.
 */
import BaseStore from './BaseStore';
import Actions from '../constants/Actions';
import StorageKeys from '../constants/StorageKeys';

var user = null;
class UserStore extends BaseStore {
    constructor() {
        super();

        BaseStore.subscribe(this._userActions.bind(this));
    }

    _userActions(action) {
        switch (action.actionType) {
        }
    }

    getUser() {
        return user;
    }

    isLoggedIn() {
        return !!this._user;
    }
}

export default new UserStore();