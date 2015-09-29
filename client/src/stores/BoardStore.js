import BaseStore from './BaseStore';
import Actions from '../constants/Actions';
import StorageKeys from '../constants/StorageKeys';

// Hash with board ID as keys and {isStale: Boolean, staleness: Number}
var staleness = {};
class BoardStore extends BaseStore {
    constructor() {
        super();

        BaseStore.subscribe(this._actions.bind(this));
    }

    _actions(action) {
        if (action.state !== Actions.State.complete) return;

        switch(action.actionType) {
            case Actions.checkStaleness:
                if (staleness[action.boardId]) {
                    if (staleness[action.boardId].staleness !== action.staleness) {
                        staleness[action.boardId].staleness = action.staleness;
                        staleness[action.boardId].isStale = true;
                    }
                } else {
                    staleness[action.boardId] = {
                        isState: true,
                        staleness: staleness
                    };
                }
                this.emitChange();
                break;
            case Actions.retrieveUser:
                var boards = action.data.data.attributes.boards;
                for (var i = 0; i < boards.length; i++) {
                    var boardId = boards[i].id;
                    if (staleness[boardId]) {
                        staleness[boardId].isStale = false;
                    } else {
                        staleness[boardId] = {
                            isStale: false,
                            staleness: 0
                        };
                    }
                }
                break;
        }
    }

    /**
     * Checks if a board is stale.
     * @param {String} id the board ID.
     */
    isStale(id) {
        if (!staleness[id]) return true;
        return staleness[id].isStale;
    }
}

export default new BoardStore();