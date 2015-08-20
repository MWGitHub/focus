import {EventEmitter} from 'events';
import Dispatcher from '../utils/Dispatcher';

const CHANGE = 'CHANGE';
export default class BaseStore extends EventEmitter {
    constructor() {
        super();
    }

    emitChange() {
        this.emit(CHANGE);
    }

    addChangeListener(cb) {
        this.on(CHANGE, cb);
    }

    removeChangeListener(cb) {
        this.removeListener(CHANGE, cb);
    }

    /**
     * Subscribes to the dispatcher.
     * @param {*} action the action handler.
     * @returns {string} the dispatch token.
     */
    static subscribe(action) {
        return Dispatcher.register(action);
    }
}
