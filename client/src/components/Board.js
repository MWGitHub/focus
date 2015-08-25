import React from 'react';
import UserStore from '../stores/UserStore';
import Authenticator from './Authenticator';
import BoardActions from '../actions/BoardActions';

class Task extends React.Component {
    constructor(props) {
        super(props);
    }

    deleteTask(e) {
        e.preventDefault();

        BoardActions.deleteTask(this.props.task.id);
    }

    render() {
        var task = this.props.task;
        return <div className="task">
            <h3>{task.attributes.title}</h3>
            <button onClick={this.deleteTask.bind(this)}>Delete</button>
        </div>
    }
}

class List extends React.Component {
    constructor(props) {
        super(props);
    }

    _updateTaskError(err) {

    }

    createTask(tasks) {
        return function(event) {
            event.preventDefault();
            console.log(event);

            var title = React.findDOMNode(this.refs.title).value;
            if (!title) {
                return;
            }

            // Set position to mid value if there are no tasks otherwise set it to the next lowest.
            var position = tasks.length == 0 ? Number.MAX_SAFE_INTEGER : tasks[0].attributes.position / 2;

            BoardActions.createTask(this.props.list.id, title, position, this._updateTaskError.bind(this));
        }
    }

    render() {
        var list = this.props.list;
        // Sort the tasks by position
        var tasks = list.attributes.tasks;
        tasks.sort(function(a, b) {
            if (a.attributes.position > b.attributes.position) {
                return 1
            } else if (a.attributes.position < b.attributes.position) {
                return -1;
            }
            return 0;
        });
        console.log(tasks);

        return <div className="list">
            <h2>{list.attributes.title}</h2>
            <form onSubmit={this.createTask(tasks).bind(this)}>
                <label htmlFor="task-title">Task Title</label>
                <input id="task-title" type="text" ref="title" placeholder="e.g. Open Text Editor" required />
                <input type="submit" value="Create" />
            </form>

            {list.attributes.tasks.map((task) => {
                return <Task task={task} key={task.id} />
            })}
        </div>;
    }
}

class BoardView extends React.Component {
    constructor(props) {
        super(props);
    }

    getListByTitle(lists, title) {
        for (var i = 0; i < lists.length; i++) {
            if (lists[i].attributes.title == title) return lists[i];
        }
        return null;
    }

    render() {
        var board = this.props.board;
        var lists = board.attributes.lists;

        var tasks = this.getListByTitle(lists, 'Tasks');
        var tomorrow = this.getListByTitle(lists, 'Tomorrow');
        var today = this.getListByTitle(lists, 'Today');
        var done = this.getListByTitle(lists, 'Done');
        return (
            <div className="board">
                <List list={tasks} key={tasks.id} />
                <List list={tomorrow} key={tomorrow.id} />
                <List list={today} key={today.id} />
                <List list={done} key={done.id} locked={true} />
            </div>
        )
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
        };
    }

    componentDidMount() {
        this.listener = this.onChange.bind(this);
        UserStore.addChangeListener(this.listener);

        BoardActions.retrieveData();
    }

    onChange() {
        this.setState({
            data: UserStore.getData()
        });
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.listener);
    }

    render() {
        if (!this.state.data) return null;
        return (
            <BoardView board={this.state.data.attributes.boards[0]} />
        )
    }
}

export default Authenticator(Board);