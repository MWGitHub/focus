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
    }

    render() {
        var task = this.props.task;
        return <div className="task">
            <h3>{task.attributes.title}</h3>
            <button onclick={this.deleteTask.bind(this)}>Delete</button>
        </div>
    }
}

class List extends React.Component {
    constructor(props) {
        super(props);
    }

    _updateTaskError(err) {

    }

    createTask(e) {
        e.preventDefault();

        var title = React.findDOMNode(this.refs.title).value;
        if (!title) {
            return;
        }

        BoardActions.createTask(title, this.props.id, this._updateTaskError.bind(this));
    }

    render() {
        var list = this.props.list;

        return <div className="list">
            <h2>{list.attributes.title}</h2>
            <form onSubmit={this.createTask.bind(this)}>
                <label htmlFor="task-title">Task Title</label>
                <input id="task-title" type="text" ref="title" placeholder="e.g. Clean Room" required />
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

    render() {
        var board = this.props.board;
        var lists = board.attributes.lists;

        return (
            <div className="board">
                {lists.map((list) => {
                    return <List list={list} key={list.id} />
                })}
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