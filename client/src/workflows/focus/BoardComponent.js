import React from 'react';
import UserStore from '../../stores/UserStore';
import Authenticator from './../../components/Authenticator';
import BoardActions from '../../actions/BoardActions';
import UserActions from '../../actions/UserActions';
import AuthStore from '../../stores/AuthStore';
import moment from 'moment-timezone';
import DraggableList from '../../utils/DraggableList';
import Dispatcher from '../../utils/Dispatcher';
import BoardStore from '../../stores/BoardStore';
import Task from './TaskComponent';
import List from './ListComponent';
import BoardUtil from '../../utils/WorkflowUtil';
import Constants from './Constants';

/**
 * Flags for disabled features in a list.
 */
var ListDisableOptions = {
    tasks: {left: true, complete: true, age: true},
    tomorrow: {right: true, complete: true, age: true},
    today: {create: false, left: true, right: true, sort: true},
    done: {create: true, del: true, left: true, right: true, complete: true, sort: true}
};

/**
 * Renders the board and sets the settings for the lists.
 */
class BoardView extends React.Component {
    constructor(props) {
        super(props);

        this.onMouseDown = this._onMouseDown.bind(this);
        this.onMouseUp = this._onMouseUp.bind(this);
        this.onTouchStart = this._onTouchStart.bind(this);
        this.onTouchEnd = this._onTouchEnd.bind(this);
    }

    componentDidMount() {
        this.mouseDownX = 0;
        // Amount of distance before swiping
        this.swipeDifference = 75;
        // Current list in view
        this.currentList = 0;

        this.listLeft = [];
        var lists = document.getElementsByClassName('list');
        for (var i = 0; i < lists.length; i++) {
            var bounds = lists[i].getBoundingClientRect();
            this.listLeft.push(bounds.left);
        }

        //document.addEventListener('mousedown', this.onMouseDown);
        //document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('touchstart', this.onTouchStart);
        document.addEventListener('touchend', this.onTouchEnd);
    }

    componentWillUnmount() {
        //document.removeEventListener('mousedown', this.onMouseDown);
        //document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchstart', this.onTouchStart);
        document.removeEventListener('touchend', this.onTouchEnd);
    }

    _onTouchStart(e) {
        this.mouseDownX = e.touches[0].clientX;
    }

    _onTouchEnd(e) {
        var diff = this.mouseDownX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > this.swipeDifference) {
            this._onSwipeHorizontal(diff)
        }
    }

    _onMouseDown(e) {
        this.mouseDownX = e.clientX;
    }

    _onMouseUp(e) {
        var diff = this.mouseDownX - e.clientX;
        if (Math.abs(diff) > this.swipeDifference) {
            this._onSwipeHorizontal(diff)
        }
    }

    _onSwipeHorizontal(amount) {
        // Ignore if can't scroll left or right
        if (this.currentList === 0 && amount < 0 || this.currentList === this.listLeft.length - 1 && amount > 0) {
            return;
        }
        var scrollAmount = 0;
        var buffer = 20;
        if (amount < 0) {
            console.log('scroll left');
            scrollAmount = this.listLeft[this.currentList - 1];
            this.currentList -= 1;
        } else {
            console.log('scroll right');
            scrollAmount = this.listLeft[this.currentList + 1];
            this.currentList += 1;
        }
        console.log(scrollAmount);
        var board = React.findDOMNode(this.refs.board);
        board.style.overflow = 'hidden';
        board.scrollLeft = scrollAmount - buffer;
        window.setTimeout(function() {
            board.scrollLeft = scrollAmount - buffer;
            board.style.overflow = 'auto';
        }, 10);
        console.log(this.currentList);
    }

    render() {
        var board = this.props.board;
        var lists = board.attributes.lists;

        var tasks = BoardUtil.getListByTitle(lists, Constants.ListTitles.tasks);
        var tomorrow = BoardUtil.getListByTitle(lists, Constants.ListTitles.tomorrow);
        var today = BoardUtil.getListByTitle(lists, Constants.ListTitles.today);
        var done = BoardUtil.getListByTitle(lists, Constants.ListTitles.done);
        return (
            <div>
                <div className="board" ref="board">
                    <List name="tasks" uid={this.props.uid} pid={this.props.pid} lists={lists} list={tasks} key={tasks.id} disable={ListDisableOptions.tasks} />
                    <List name="tomorrow" uid={this.props.uid} pid={this.props.pid} lists={lists} list={tomorrow} key={tomorrow.id} disable={ListDisableOptions.tomorrow} />
                    <List name="today" uid={this.props.uid} pid={this.props.pid} lists={lists} list={today} key={today.id} disable={ListDisableOptions.today} />
                    <List name="done" uid={this.props.uid} pid={this.props.pid} lists={lists} list={done} key={done.id} disable={ListDisableOptions.done} />
                </div>
            </div>
        )
    }
}

/**
 * Provides data for the board and all the lists and tasks.
 */
class Board extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            uid: AuthStore.getID()
        };

        this.isRefreshing = false;
        this.onFrame = this._onFrame.bind(this);
        this.refreshTime = 10000;
    }

    _onFrame() {
        if (!this.isRefreshing) return;

        var self = this;
        var boardID = this.props.params ? this.props.params.id : this.props.bid;
        window.setTimeout(function() {
            if (!Dispatcher.isDispatching()) {
                if (self.state.isStale && self.state.data) {
                    BoardActions.retrieveBoard(boardID, true);
                } else {
                    BoardActions.checkStaleness(boardID);
                }
            }
            window.requestAnimationFrame(self.onFrame);
        }, this.refreshTime);
    }

    componentDidMount() {
        this.listener = this.onChange.bind(this);
        UserStore.addChangeListener(this.listener);
        BoardStore.addChangeListener(this.listener);

        this.isRefreshing = true;

        //window.requestAnimationFrame(this.onFrame);
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.listener);
        BoardStore.removeChangeListener(this.listener);

        this.isRefreshing = false;
    }

    onChange() {
        this.setState({
            uid: AuthStore.getID()
        });
    }

    render() {
        return (
            <BoardView pid={this.props.pid} uid={this.state.uid} board={this.props.board} />
        );
    }
}

export default Authenticator(Board);