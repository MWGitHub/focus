/**
 * Stores authentication info.
 */
import Actions from '../constants/Actions';
import BaseStore from './BaseStore';
import StorageKeys from '../constants/StorageKeys';
import LocalForage from 'localforage';
import Auth from '../utils/Auth';

class AuthStore extends BaseStore {
    constructor() {
        super();

        BaseStore.subscribe(this._actionHandler.bind(this));
        // Token for authentication
        this._jwt = null;
        // ID of the user
        this._id = null;

        // Load initial auth data if available.
        this.loadAuth();
    }

    _setFromJWT(jwt) {
        if (!jwt) {
            this._jwt = null;
            this._id = null;
        } else {
            this._jwt = jwt;
            var decoded = Auth.decodeJWT(jwt);
            this._id = decoded.data.id;
        }
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
                this._id = null;
                this.emitChange();
                if (error) error(err);
            } else {
                this._setFromJWT(value);
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
                    this._id = null;
                    this.emitChange();
                } else if (action.state === Actions.State.complete) {
                    LocalForage.setItem(StorageKeys.JWT, action.jwt, (err, result) => {
                        if (err) {
                            this._jwt = null;
                            this._id = null;
                        } else {
                            this._setFromJWT(action.jwt);
                            this.emitChange();
                        }
                    });
                }
                break;
            // Save the log in session
            case Actions.login:
                if (action.state === Actions.State.complete) {
                    LocalForage.setItem(StorageKeys.JWT, action.jwt, (err, result) => {
                        if (err) {
                            this._jwt = null;
                            this._id = null;
                        } else {
                            this._setFromJWT(action.jwt);
                            this.emitChange();
                        }
                    });
                } else if (action.state === Actions.State.failed) {
                    this._jwt = null;
                    this._id = null;
                    this.emitChange();
                }
                break;
            // Log out and delete the session.
            case Actions.logout:
                LocalForage.removeItem(StorageKeys.JWT, (err, result) => {
                    if (!err) {
                        this._jwt = null;
                        this._id = null;
                    }
                    this.emitChange();
                });
                break;
        }
    }

    getJWT() {
        return this._jwt;
    }

    getID() {
        return this._id;
    }

    isLoggedIn() {
        return !!this._jwt;
    }

    deauthorize() {
        this._jwt = null;
        this._id = null;
        LocalForage.removeItem(StorageKeys.JWT, (err, result) => {
            this.emitChange();
        });
    }
}

export default new AuthStore();