import React from 'react';
import UserStore from '../stores/UserStore';
import Authenticator from './Authenticator';
import BoardActions from '../actions/BoardActions';
import AuthStore from '../stores/AuthStore.js';

function getListByTitle(lists, title) {
    for (var i = 0; i < lists.length; i++) {
        if (lists[i].attributes.title == title) return lists[i];
    }
    return null;
}

var ListTitles = {
    tasks: 'Tasks',
    tomorrow: 'Tomorrow',
    today: 'Today',
    done: 'Done'
};

/**
 * Renders a task.
 */
class Task extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        /*
        var listElement = React.findDOMNode(this.props.list);
        listElement.addEventListener('slip:reorder', function(e) {
            console.log(e);
        });
        */
    }

    deleteTask(e) {
        e.preventDefault();

        BoardActions.deleteTask(this.props.uid, this.props.task.id);
    }

    move(e) {

    }

    complete(e) {
        e.preventDefault();

        // Should only be allowed on today's tasks
        if (this.props.list.attributes.title !== ListTitles.today) return;

        // Get the new list and position
        var nextList = getListByTitle(this.props.lists, ListTitles.done);
        var listId = nextList.id;
        var tasks = nextList.attributes.tasks;
        var position = tasks.length === 0 ? Number.MAX_SAFE_INTEGER : tasks[0].attributes.position - 1;

        BoardActions.moveTask(this.props.uid, this.props.task.id, listId, position);
    }

    moveTaskLeft(e) {
        e.preventDefault();

        // Should only be allowed to move right from tasks
        if (this.props.list.attributes.title !== ListTitles.tomorrow) return;

        // Get the new list and position
        var nextList = getListByTitle(this.props.lists, ListTitles.tasks);
        var listId = nextList.id;
        var tasks = nextList.attributes.tasks;
        var position = tasks.length === 0 ? Number.MAX_SAFE_INTEGER / 2 : tasks[0].attributes.position / 2;

        BoardActions.moveTask(this.props.uid, this.props.task.id, listId, position);
    }

    moveTaskRight(e) {
        e.preventDefault();

        // Should only be allowed to move right from tasks or today
        if (this.props.list.attributes.title !== ListTitles.tasks) return;

        // Get the new list and position
        var nextList = getListByTitle(this.props.lists, ListTitles.tomorrow);
        var listId = nextList.id;
        var tasks = nextList.attributes.tasks;
        var position = tasks.length === 0 ? Number.MAX_SAFE_INTEGER / 2 : tasks[0].attributes.position / 2;

        BoardActions.moveTask(this.props.uid, this.props.task.id, listId, position);
    }

    render() {
        var task = this.props.task;
        // Do not allow Today tasks to be deleted unless over a week old
        var shouldHideDelete = this.props.disable.del ||
            (this.props.list.attributes.title === ListTitles.today && this.props.task.attributes.age <= 7);
        return (
            <div className="task">
                <h3 className="no-margin">{task.attributes.title}</h3>
                <p>Age: {task.attributes.age}</p>
                { shouldHideDelete ? null : <button onClick={this.deleteTask.bind(this)}>Delete</button> }
                { this.props.disable.left ? null : <button onClick={this.moveTaskLeft.bind(this)}>&lt;-</button> }
                { this.props.disable.right ? null : <button onClick={this.moveTaskRight.bind(this)}>-&gt;</button> }
                { this.props.disable.complete ? null : <button onClick={this.complete.bind(this)}>Complete</button> }
            </div>
        )
    }
}

/**
 * Renders the task creating box and handles task creation.
 */
class TaskCreateBox extends React.Component {
    constructor(props) {
        super(props);
    }

    _updateTaskError(err) {

    }

    createTask(list, tasks) {
        return function(event) {
            event.preventDefault();

            var title = React.findDOMNode(this.refs.title).value;
            if (!title) {
                return;
            }
            // Clear the input
            var titleField = React.findDOMNode(this.refs.title);
            titleField.value = '';

            // Set position to mid value if there are no tasks otherwise set it to the next lowest.
            var position = tasks.length === 0 ? Number.MAX_SAFE_INTEGER : tasks[0].attributes.position / 2;

            BoardActions.createTask(this.props.uid, list.id, title, position, this._updateTaskError.bind(this));
        }
    }

    render() {
        var list = this.props.list;
        var tasks = this.props.tasks;
        return (
            <div className="task">
                <form onSubmit={this.createTask(list, tasks).bind(this)}>
                    <label htmlFor="task-title">Task Title</label>
                    <input id="task-title" type="text" ref="title" placeholder="Create New Task" required />
                    <input type="submit" value="Create" />
                </form>
            </div>
        )
    }
}

/**
 * Renders a list.
 */
class List extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (!this.props.disable.sort) {
            var element = React.findDOMNode(this);
            var slip = new Slip(element);
        }
    }

    render() {
        var list = this.props.list;
        // Sort the tasks by position
        var tasks = list.attributes.tasks;
        return (
            <div id={"list-" + list.id} className="list rounded">
                <h2 className="no-margin">{list.attributes.title}</h2>

                {this.props.disable.create ? null : <TaskCreateBox uid={this.props.uid} list={list} tasks={tasks} /> }
                {list.attributes.tasks.map((task) => {
                    return <Task uid={this.props.uid} lists={this.props.lists} list={list} task={task} key={task.id} disable={this.props.disable} />
                })}
            </div>
        )
    }
}

/**
 * Renders the board and sets the settings for the lists.
 */
class BoardView extends React.Component {
    constructor(props) {
        super(props);
    }

    _forceUpdateError(err) {

    }

    forceUpdate(event) {
        event.preventDefault();

        BoardActions.forceUserUpdate(this.props.uid);
    }

    render() {
        var board = this.props.board;
        var lists = board.attributes.lists;

        var tasks = getListByTitle(lists, ListTitles.tasks);
        var tomorrow = getListByTitle(lists, ListTitles.tomorrow);
        var today = getListByTitle(lists, ListTitles.today);
        var done = getListByTitle(lists, ListTitles.done);
        return (
            <div>
                <input type="button" value="Force Update" onClick={this.forceUpdate.bind(this)} />
                <div className="board">
                    <List uid={this.props.uid} lists={lists} list={tasks} key={tasks.id} disable={{left: true, complete: true}} />
                    <List uid={this.props.uid} lists={lists} list={tomorrow} key={tomorrow.id} disable={{right: true, complete: true}} />
                    <List uid={this.props.uid} lists={lists} list={today} key={today.id} disable={{create: true, left: true, right: true}} />
                    <List uid={this.props.uid} lists={lists} list={done} key={done.id} disable={{create: true, del: true, left: true, right: true, complete: true, sort: true}} />
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
            data: UserStore.getData(),
            uid: AuthStore.getID()
        };
    }

    componentDidMount() {
        this.listener = this.onChange.bind(this);
        UserStore.addChangeListener(this.listener);

        BoardActions.retrieveData(this.state.uid);
    }

    onChange() {
        this.setState({
            data: UserStore.getData(),
            uid: AuthStore.getID()
        });
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.listener);
    }

    render() {
        if (!this.state.data) return null;
        return (
            <BoardView uid={this.state.uid} board={this.state.data.attributes.boards[0]} />
        )
    }
}

export default Authenticator(Board);