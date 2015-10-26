/**
 * Stores board data
 */

import BaseStore from './BaseStore';
import Actions from '../constants/Actions';
import StorageKeys from '../constants/StorageKeys';

// Hash with board ID as keys and {isStale: Boolean, staleness: Number}
var staleness = {};

// Hashes with ID as key and data as value
var projectData = {};
var boardData = {};
var listData = {};
var taskData = {};
class BoardStore extends BaseStore {
    constructor() {
        super();

        BaseStore.subscribe(this._actions.bind(this));
    }

    _updateStaleness(id) {
        if (staleness[id]) {
            staleness[id].isStale = false;
        } else {
            staleness[id] = {
                isStale: false,
                staleness: 0
            };
        }
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
                var projects = action.data.data.attributes.projects;
                for (var i = 0; i < projects.length; i++) {
                    var projectID = projects[i].id;
                    this._updateStaleness(projectID);
                }
                break;
            case Actions.retrieveProject:
                projectData[action.data.data.id] = action.data.data;
                this._updateStaleness(action.data.data.id);
                this.emitChange();
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

    getProjectData(id) {
        return projectData[id];
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