import {EventEmitter} from 'events';
import Dispatcher from '../utils/dispatcher.js';

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

    static subscribe(action) {
        Dispatcher.register(action);
    }
}
