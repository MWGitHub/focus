/**
 * Stores board data
 */

import BaseStore from './BaseStore';
import Actions from '../constants/Actions';
import StorageKeys from '../constants/StorageKeys';

// Hash with board ID as keys and {isStale: Boolean, staleness: Number}
var staleness = {};

// Hashes with ID as key and data as value
var boardData = {};
var listData = {};
var taskData = {};
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
            case Actions.retrieveBoard:
                boardData[action.data.data.id] = action.data.data;
                this.emitChange();
                break;
            case Actions.retrieveList:
                listData[action.data.data.id] = action.data.data;
                this.emitChange();
                break;
            case Actions.retrieveTask:
                taskData[action.data.data.id] = action.data.data;
                this.emitChange();
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

    getBoardData(id) {
        return boardData[id];
    }

    getListData(id) {
        return listData[id];
    }

    getTaskData(id) {
        return taskData[id];
    }
}

export default new BoardStore();