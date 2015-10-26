import React from 'react';
import BoardActions from '../../actions/BoardActions';
import Constants from './Constants';
import BoardUtil from '../../utils/WorkflowUtil';
import WorkflowUtil from '../../utils/WorkflowUtil';

class Task extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    deleteTask(e) {
        e.preventDefault();

        BoardActions.deleteTask(this.props.pid, this.props.task.id);
    }

    complete(e) {
        e.preventDefault();

        // Should only be allowed on today's tasks
        if (this.props.list.attributes.title !== Constants.ListTitles.today) return;

        // Get the new list and position
        var nextList = WorkflowUtil.getListByTitle(this.props.lists, Constants.ListTitles.done);
        var listId = nextList.id;
        var tasks = nextList.attributes.tasks;
        var position = tasks.length === 0 ? Number.MAX_SAFE_INTEGER : tasks[0].attributes.position - 1;

        BoardActions.moveTask(this.props.pid, this.props.task.id, listId, position);
    }

    moveTaskLeft(e) {
        e.preventDefault();

        // Should only be allowed to move right from tasks
        if (this.props.list.attributes.title !== Constants.ListTitles.tomorrow) return;

        // Get the new list and position
        var nextList = WorkflowUtil.getListByTitle(this.props.lists, Constants.ListTitles.tasks);
        var listId = nextList.id;
        var tasks = nextList.attributes.tasks;
        var position = tasks.length === 0 ? Number.MAX_SAFE_INTEGER / 2 : tasks[0].attributes.position / 2;

        BoardActions.moveTask(this.props.pid, this.props.task.id, listId, position);
    }

    moveTaskRight(e) {
        e.preventDefault();

        // Should only be allowed to move right from tasks or today
        if (this.props.list.attributes.title !== Constants.ListTitles.tasks) return;

        // Get the new list and position
        var nextList = WorkflowUtil.getListByTitle(this.props.lists, Constants.ListTitles.tomorrow);
        var listId = nextList.id;
        var tasks = nextList.attributes.tasks;
        var position = tasks.length === 0 ? Number.MAX_SAFE_INTEGER / 2 : tasks[0].attributes.position / 2;

        BoardActions.moveTask(this.props.pid, this.props.task.id, listId, position);
    }

    render() {
        var task = this.props.task;
        // Do not allow Today tasks to be deleted unless over a week old
        var shouldHideDelete = this.props.disable.del ||
            (this.props.list.attributes.title === Constants.ListTitles.today && this.props.task.attributes.age <= 7);
        var style = 'task';
        // Complete tasks
        var completeNormal = (
            <input className="right positive" type="button" button onClick={this.complete.bind(this)} value="complete" />
        );
        return (
            <div id={'task:' + this.props.list.id + ":" + this.props.task.id} className={'draggable ' + style}>
                <h3><span dangerouslySetInnerHTML={{__html: task.attributes.title}} /></h3>
                <div className="task-info">
                    { shouldHideDelete ? null : <button className="left negative" onClick={this.deleteTask.bind(this)}><span>delete</span></button> }
                    { this.props.disable.left ? null : <input className="right" type="button" onClick={this.moveTaskLeft.bind(this)} value="dequeue" /> }
                    { this.props.disable.right ? null : <input className="right positive" type="button" button onClick={this.moveTaskRight.bind(this)} value="queue" /> }
                    { this.props.disable.complete ? null : completeNormal }
                    { this.props.disable.age ? null : <span className={"age left age-" + task.attributes.age}>age: {task.attributes.age}</span> }
                    { task.attributes.extra ? <span className="task-flag left">extra</span> : null }
                </div>
            </div>
        )
    }
}

export default Task;