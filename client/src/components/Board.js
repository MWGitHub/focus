import React from 'react';
import UserStore from '../stores/UserStore';
import Authenticator from './Authenticator';
import BoardActions from '../actions/BoardActions';
import AuthStore from '../stores/AuthStore';
import Validate from '../utils/Validation';

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
                <h3>{task.attributes.title}</h3>
                { this.props.disable.age ? null : <p>Age: {task.attributes.age}</p> }
                { shouldHideDelete ? null : <input className="left negative" type="button" onClick={this.deleteTask.bind(this)} value="delete" /> }
                { this.props.disable.left ? null : <input className="right" type="button" onClick={this.moveTaskLeft.bind(this)} value="dequeue" /> }
                { this.props.disable.right ? null : <input className="right positive" type="button" button onClick={this.moveTaskRight.bind(this)} value="queue" /> }
                { this.props.disable.complete ? null : <input className="right positive" type="button" button onClick={this.complete.bind(this)} value="complete" /> }
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
        this.state = {
            message: null
        };
        this.inputChange = this._onInputChange.bind(this);
    }

    componentDidMount() {
        var taskTitle = React.findDOMNode(this.refs.title);
        taskTitle.addEventListener('change', this.inputChange);
    }

    componentWillUnmount() {
        var taskTitle = React.findDOMNode(this.refs.title);
        taskTitle.removeEventListener('change', this.inputChange);
    }

    _updateTaskError(err) {

    }

    _onInputChange(e) {
        var v = e.target.value;
        var message = Validate.task(v);
        this.setState({
            message: message
        });
    }

    createTask(list, tasks) {
        return function(event) {
            event.preventDefault();

            var title = React.findDOMNode(this.refs.title).value;
            if (!title || Validate.task(title)) {
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
                    <div className="top">
                        <label htmlFor="task-title">New Task</label>
                        { this.state.message ? <span className="error">{this.state.message}</span> : null }
                    </div>
                    <input className={this.state.message ? "error" : ""} id="task-title" type="text" ref="title" placeholder="Create New Task" required />
                    <input className="left negative" type="button" value="cancel" onClick={this.props.closeCallback} />
                    <input className="right positive" type="submit" value="create" />
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

        this.state = {
            isCreateShown: false
        };
        this.onWindowSizeChange = this._onWindowSizeChange.bind(this);
    }

    componentDidMount() {
        if (!this.props.disable.sort) {
            var element = React.findDOMNode(this.refs.list);
            var slip = new Slip(element);
        }

        this._calculateHeight();
        window.addEventListener('resize', this.onWindowSizeChange);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowSizeChange);
    }

    _onWindowSizeChange() {
        this._calculateHeight();
    }

    _calculateHeight() {
        // Set the height of the lists
        var windowHeight = window.innerHeight;
        var lists = document.getElementsByClassName('list-bottom');
        var top = document.getElementById('header').clientHeight;
        top += document.getElementsByClassName('list-top')[0].clientHeight;
        // With default font size at 16px
        var padding = 0.5 * 16 * 2;
        top += padding;
        top += document.getElementsByClassName('list-cap')[0].clientHeight;
        for (var i = 0; i < lists.length; i++) {
            lists[i].style['max-height'] = (windowHeight - top).toString() + 'px';
        }
    }

    _forceUpdateError(err) {

    }

    forceUpdate(event) {
        event.preventDefault();

        BoardActions.forceUserUpdate(this.props.uid);
    }

    createButtonClicked(event) {
        event.preventDefault();

        this.setState({
            isCreateShown: !this.state.isCreateShown
        });
    }

    createDialogClosed() {
        this.setState({
            isCreateShown: false
        });
    }

    render() {
        var list = this.props.list;
        // Sort the tasks by position
        var tasks = list.attributes.tasks;
        var updateButton = (
            <input className="right" type="button" value="force update" onClick={this.forceUpdate.bind(this)} />
        );
        var createButton = (
            <input className="create right" type="button" value="+" onClick={this.createButtonClicked.bind(this)} />
        );
        var taskCreateBox = (
            <TaskCreateBox uid={this.props.uid} list={list} tasks={tasks} closeCallback={this.createDialogClosed.bind(this)} />
        );

        return (
            <div id={"list-" + list.id} className="list">
                <div className="list-top">
                    <h2 className="no-margin">{list.attributes.title}</h2>
                    { this.props.name === 'today' ? updateButton : null }
                    { this.props.disable.create ? null : createButton }
                </div>
                <div className={"list-bottom " + 'list-' + this.props.name} ref="list">
                    {this.state.isCreateShown ? taskCreateBox : null }
                    {list.attributes.tasks.map((task) => {
                        return <Task uid={this.props.uid} lists={this.props.lists} list={list} task={task} key={task.id} disable={this.props.disable} />
                    })}
                </div>
                <div className={"list-cap"}></div>
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

    render() {
        var board = this.props.board;
        var lists = board.attributes.lists;

        var tasks = getListByTitle(lists, ListTitles.tasks);
        var tomorrow = getListByTitle(lists, ListTitles.tomorrow);
        var today = getListByTitle(lists, ListTitles.today);
        var done = getListByTitle(lists, ListTitles.done);
        return (
            <div>
                <div className="board">
                    <List name="tasks" uid={this.props.uid} lists={lists} list={tasks} key={tasks.id} disable={{left: true, complete: true, age: true}} />
                    <List name="tomorrow" uid={this.props.uid} lists={lists} list={tomorrow} key={tomorrow.id} disable={{right: true, complete: true, age: true}} />
                    <List name="today" uid={this.props.uid} lists={lists} list={today} key={today.id} disable={{create: true, left: true, right: true}} />
                    <List name="done" uid={this.props.uid} lists={lists} list={done} key={done.id} disable={{create: true, del: true, left: true, right: true, complete: true, sort: true}} />
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