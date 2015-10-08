import React from 'react';
import Validate from '../../utils/Validation';
import BoardActions from '../../actions/BoardActions';

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

            BoardActions.createTask(this.props.bid, list.id, title, position, this.props.extra, this._updateTaskError.bind(this));
        }
    }

    render() {
        var list = this.props.list;
        var tasks = this.props.tasks;
        var title = "New Task";
        var style = "task create-task";
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

TaskCreateBox.propTypes = {

};

export default TaskCreateBox;