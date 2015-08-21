/**
 * Stores authentication info.
 */
import Actions from '../constants/Actions';
import BaseStore from './BaseStore';
import StorageKeys from '../constants/StorageKeys';
import LocalForage from 'localforage';

class AuthStore extends BaseStore {
    constructor() {
        super();

        BaseStore.subscribe(this._actionHandler.bind(this));
        this._jwt = null;

        // Load initial auth data if available.
        this.loadAuth();
    }

    /**
     * Load auth data.
     * @param {Function<String>?} success the callback to run on success which takes in a token.
     * @param {Function<Error>?} error the error callback which takes in an error.
     */
    loadAuth(success, error) {
        LocalForage.getItem(StorageKeys.JWT, (err, value) => {
            if (err) {
                this._jwt = null;
                this.emitChange();
                if (error) error(err);
            } else {
                this._jwt = value;
                this.emitChange();
                if (success) success(value);
            }
        });
    }

    _actionHandler(action) {
        switch (action.actionType) {
            // Save the log in session once registered
            case Actions.register:
                if (action.state === Actions.State.failed) {
                    this._jwt = null;
                    this.emitChange();
                } else if (action.state === Actions.State.complete) {
                    LocalForage.setItem(StorageKeys.JWT, action.jwt, (err, result) => {
                        this._jwt = action.jwt;
                        if (err) {
                            this._jwt = null;
                        } else {
                            this.emitChange();
                        }
                    });
                }
                break;
            // Save the log in session
            case Actions.login:
                if (action.state === Actions.State.complete) {
                    LocalForage.setItem(StorageKeys.JWT, action.jwt, (err, result) => {
                        this._jwt = action.jwt;
                        if (err) {
                            this._jwt = null;
                        } else {
                            this.emitChange();
                        }
                    });
                } else if (action.state === Actions.State.failed) {
                    this._jwt = null;
                    this.emitChange();
                }
                break;
            // Log out and delete the session.
            case Actions.logout:
                LocalForage.removeItem(StorageKeys.JWT, (err, result) => {
                    if (!err) this._jwt = null;
                    this.emitChange();
                });
                break;
        }
    }

    getJWT() {
        return this._jwt;
    }

    isLoggedIn() {
        return !!this._jwt;
    }
}

export default new AuthStore();