import React from 'react';
import UserStore from '../stores/UserStore';
import Authenticator from './Authenticator';
import BoardActions from '../actions/BoardActions';
import UserActions from '../actions/UserActions';
import AuthStore from '../stores/AuthStore';
import Validate from '../utils/Validation';
import moment from 'moment-timezone';
import DraggableList from '../utils/DraggableList';

function getListByTitle(lists, title) {
    for (var i = 0; i < lists.length; i++) {
        if (lists[i].attributes.title == title) return lists[i];
    }
    return null;
}

/**
 * List titles in the API.
 * @type {{tasks: string, tomorrow: string, today: string, done: string}}
 */
var ListTitles = {
    tasks: 'Tasks',
    tomorrow: 'Tomorrow',
    today: 'Today',
    done: 'Done'
};

/**
 * Displayable title for the list.
 * @type {{tasks: string, tomorrow: string, today: string, done: string}}
 */
var ListTitleDisplay = {
    tasks: 'Tasks',
    tomorrow: 'Tomorrow',
    today: 'Today',
    done: 'Recently Completed'
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
        var style = 'task';
        // Temporary tasks complete by deletion.
        var completeNormal = (
            <input className="right positive" type="button" button onClick={this.complete.bind(this)} value="complete" />
        );
        var completeTemporary = (
            <input className="right positive" type="button" button onClick={this.deleteTask.bind(this)} value="complete" />
        );
        var complete = task.attributes.temporary ? completeTemporary : completeNormal;
        if (task.attributes.temporary) {
            style += ' temporary';
        }
        return (
            <div className={'draggable ' + style}>
                <h3><span dangerouslySetInnerHTML={{__html: task.attributes.title}} /></h3>
                <div className="task-info">
                    { shouldHideDelete ? null : <input className="left negative" type="button" onClick={this.deleteTask.bind(this)} value="delete" /> }
                    { this.props.disable.left ? null : <input className="right" type="button" onClick={this.moveTaskLeft.bind(this)} value="dequeue" /> }
                    { this.props.disable.right ? null : <input className="right positive" type="button" button onClick={this.moveTaskRight.bind(this)} value="queue" /> }
                    { this.props.disable.complete ? null : complete }
                    { task.attributes.temporary || this.props.disable.age ? null : <span className="age left">age: {task.attributes.age}</span> }
                </div>
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

            BoardActions.createTask(this.props.uid, list.id, title, position, this.props.temporary, this._updateTaskError.bind(this));
        }
    }

    render() {
        var list = this.props.list;
        var tasks = this.props.tasks;
        var title = this.props.temporary ? "New Temporary Task" : "New Task";
        var style = this.props.temporary ? "task create-task temporary" : "task create-task";
        return (
            <div className={style}>
                <form onSubmit={this.createTask(list, tasks).bind(this)}>
                    <div className="top">
                        <label htmlFor="task-title">{ title }</label>
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
            var draggable = new DraggableList(element, 'draggable');
            draggable.shadowClass = 'dragging-shadow';
            draggable.draggingClass = 'dragging';
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

    /**
     * Calculate the horizontal scroll bar.
     * @returns {number} the horizontal scroll bar height.
     * @private
     */
    _calculateScrollbarHeight() {
        var inner = document.createElement('p');
        inner.style.width = "200px";
        inner.style.height = "100px";

        var outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.height = "100px";
        outer.style.overflow = "hidden";
        outer.appendChild(inner);

        document.body.appendChild(outer);
        var h1 = outer.offsetHeight;
        outer.style.overflow = 'scroll';
        var h2 = outer.clientHeight;

        document.body.removeChild(outer);

        return (h1 - h2);
    }

    _calculateHeight() {
        // Set the height of the lists
        var windowHeight = window.innerHeight;
        var lists = document.getElementsByClassName('list-bottom');
        var top = document.getElementById('header').clientHeight;
        top += document.getElementsByClassName('list-top')[0].clientHeight;
        top += document.getElementsByClassName('list-cap')[0].clientHeight;
        top += 16;
        // Give some height for scroll bars.
        top += this._calculateScrollbarHeight();
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

        React.findDOMNode(this.refs.list).scrollTop = 0;
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
        var createButton = (
            <input className="create right" type="button" value="+" onClick={this.createButtonClicked.bind(this)} />
        );

        var todayTop = (
            <div>
                <input className="create right temporary" type="button" value="+" onClick={this.createButtonClicked.bind(this)} />
                <input className="right" type="button" value="force update" onClick={this.forceUpdate.bind(this)} />
            </div>
        );
        var taskCreateBox = (
            <TaskCreateBox uid={this.props.uid} list={list} tasks={tasks} closeCallback={this.createDialogClosed.bind(this)} />
        );
        var temporaryCreateBox = (
            <TaskCreateBox uid={this.props.uid} list={list} tasks={tasks} closeCallback={this.createDialogClosed.bind(this)} temporary={true} />
        );

        var taskDescription = (
            <p className="list-description">Place tasks to be done in the future here.</p>
        );
        var tomorrowDescription = (
            <p className="list-description">These tasks will move to the "Today" list at midnight.</p>
        );
        var todayDescription = (
            <p className="list-description">Tasks in this list are not removable unless aged for over 7 days.</p>
        );
        var doneDescription = (
            <p className="list-description">Tasks that have been recently completed will be placed here.</p>
        );

        // Sort the tasks by age.
        if (list.attributes.title === ListTitles.today) {
            var tasks = list.attributes.tasks.sort(function (a, b) {
                if (a.attributes.age < b.attributes.age) {
                    return 1;
                } else if (a.attributes.age > b.attributes.age) {
                    return -1;
                }
                return 0;
            });
        }

        // Limit done tasks (should be done server side)
        if (tasks.length > 10 && list.attributes.title === ListTitles.done) {
            tasks = tasks.slice(0, 10);
        }

        return (
            <div id={"list-" + list.id} className="list">
                <div className="list-top">
                    <h2 className="no-margin">{ListTitleDisplay[this.props.name]}</h2>
                    { this.props.disable.create ? null : createButton }
                    { list.attributes.title === ListTitles.today ? todayTop : null }
                </div>
                <div className={"list-bottom " + 'list-' + this.props.name} ref="list">
                    {this.state.isCreateShown && list.attributes.title !== ListTitles.today ? taskCreateBox : null }
                    {this.state.isCreateShown && list.attributes.title === ListTitles.today ? temporaryCreateBox : null}
                    {list.attributes.tasks.length === 0 && list.attributes.title === ListTitles.tasks ? taskDescription : null}
                    {list.attributes.tasks.length === 0 && list.attributes.title === ListTitles.tomorrow ? tomorrowDescription : null}
                    {list.attributes.tasks.length === 0 && list.attributes.title === ListTitles.today ? todayDescription : null}
                    {list.attributes.tasks.length === 0 && list.attributes.title === ListTitles.done ? doneDescription : null}
                    {tasks.map((task) => {
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

        UserActions.retrieveData(this.state.uid);
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