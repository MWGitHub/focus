import React from 'react';
import BoardActions from '../../actions/BoardActions';
import Constants from './Constants';
import Task from './TaskComponent';
import DraggableList from '../../utils/DraggableList';

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

            BoardActions.createTask(this.props.uid, list.id, title, position, this.props.extra, this._updateTaskError.bind(this));
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

    componentWillUpdate() {
        // Place all tasks back in their original locations
        if (!this.props.disable.sort) {
            var tasks = this.props.list.attributes.tasks;
            for (var i = 0; i < tasks.length; i++) {
                var id = tasks[i].id;
                var element = document.getElementById('task:' + this.props.list.id + ':' + id);
                var parent = element.parentNode;
                parent.removeChild(element);
                parent.appendChild(element);
            }
        }
    }

    componentDidMount() {
        this.onClick = this._onClick.bind(this);
        document.addEventListener('mouseup', this.onClick);

        if (!this.props.disable.sort) {
            var element = React.findDOMNode(this.refs.list);

            this.draggable = new DraggableList(element, 'draggable');
            this.draggable.shadowClass = 'dragging-shadow';
            this.draggable.draggingClass = 'dragging';
            this.draggable.onDrop = this._onSwapPosition.bind(this);
        }

        this._calculateHeight();
        window.addEventListener('resize', this.onWindowSizeChange);

        // Refresh window in cases where resize does not trigger
        this.windowHeight = window.innerHeight;
        this.refreshWindow = true;
        var self = this;
        var requestFrame = function() {
            if (!self.refreshWindow) return;
            window.requestAnimationFrame(function() {
                window.setTimeout(function() {
                    if (self.windowHeight !== window.innerHeight) {
                        self._calculateHeight();
                    }
                    self.windowHeight = window.innerHeight;
                    requestFrame();
                }, 1000);
            });
        };
        requestFrame();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowSizeChange);
        document.removeEventListener('mouseup', this.onClick);
        if (!this.props.disable.sort) {
            this.draggable.destroy();
        }
        this.refreshWindow = false;
    }

    _onClick(e) {
        // Remove task create when clicking outside the button or dialog.
        if (this.state.isCreateShown) {
            var createBox = React.findDOMNode(this.refs.createBox);
            var createTaskButton = React.findDOMNode(this.refs.createTaskButton);
            if (!createBox.contains(e.target) && !createTaskButton.contains(e.target)) {
                this.setState({
                    isCreateShown: false
                });
            }
        }
    }

    _onSwapPosition(target, element, isFromAbove) {
        if (!element) return;

        var targetID = target.id.split(":")[2];
        var targetTask = null;
        var swapID = element.id.split(":")[2];
        var tasks = this.props.list.attributes.tasks;

        var previous = null;
        var swap = null;
        var next = null;
        for (var i = 0; i < tasks.length; i++) {
            // Get the target task
            if (tasks[i].id.toString() === targetID.toString()) {
                targetTask = tasks[i];
            }
            // Get the tasks around the swapped element and itself
            if (tasks[i].id.toString() === swapID.toString()) {
                swap = tasks[i];
                if (i > 0) previous = tasks[i - 1];
                if (i < tasks.length - 1) next = tasks[i + 1];
            }
            if (targetTask && previous) break;
        }

        // Used for debugging
        var oldTargetPosition = targetTask.attributes.position;

        var targetPos = -1;
        var positionFound = false;
        // Do nothing if task has not moved
        if ((previous === targetTask && isFromAbove) || (next === targetTask && !isFromAbove)) {
            return;
        }

        // If target is previous or next of the element get midpoint between the two positions
        if (previous === targetTask) {
            console.log('swap-prev');
            if (next) {
                targetPos = (swap.attributes.position + next.attributes.position) / 2;
            } else {
                targetPos = (swap.attributes.position + Number.MAX_SAFE_INTEGER) / 2;
            }
            positionFound = true;
        } else if (next === targetTask) {
            console.log('swap-next');
            if (previous) {
                targetPos = (swap.attributes.position + previous.attributes.position) / 2;
            } else {
                targetPos = swap.attributes.position / 2;
            }
            positionFound = true;
        }

        if (!positionFound) {
            if (isFromAbove) {
                if (!previous) {
                    targetPos = swap.attributes.position / 2;
                } else {
                    targetPos = (swap.attributes.position + previous.attributes.position) / 2;
                }
            } else {
                if (!next) {
                    targetPos = (swap.attributes.position + Number.MAX_SAFE_INTEGER) / 2;
                } else {
                    targetPos = (swap.attributes.position + next.attributes.position) / 2;
                }
            }
        }
        /*
         console.log(targetTask);
         console.log(element);
         console.log(isFromAbove);
         console.log(swapID);
         console.log("target old: " + oldTargetPosition);
         console.log("target new: " + targetPos);
         */

        targetTask.attributes.position = targetPos;

        BoardActions.moveTask(this.props.uid, targetID, this.props.list.id, targetPos);
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

    forceUserUpdate(event) {
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
        var tasks = list.attributes.tasks;
        var createButton = (
            <button ref="createTaskButton" className="create right" onClick={this.createButtonClicked.bind(this)}>
                <i className="fa fa-plus fa-pull-right"></i><span>add task</span>
            </button>
        );
        var taskCreateBox = (
            <TaskCreateBox uid={this.props.uid} list={list} tasks={tasks} closeCallback={this.createDialogClosed.bind(this)} ref="createBox" />
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
        if (list.attributes.title === Constants.ListTitles.today) {
            tasks = tasks.sort(function (a, b) {
                if (a.attributes.age === 0 || b.attributes.age === 0) {
                    if (a.attributes.extra && (!b.attributes.extra || b.attributes.age > 0)) {
                        return -1;
                    } else if ((!a.attributes.extra || a.attributes.age > 0) && b.attributes.extra) {
                        return 1;
                    }
                }
                if (a.attributes.age < b.attributes.age) {
                    return 1;
                } else if (a.attributes.age > b.attributes.age) {
                    return -1;
                }
                return 0;
            });
        } else {
            // Sort the tasks by position
            tasks = tasks.sort(function (a, b) {
                if (a.attributes.position > b.attributes.position) {
                    return 1;
                } else if (a.attributes.position < b.attributes.position) {
                    return -1;
                }
                return 0;
            });
        }

        // Limit done tasks
        // TODO: Make this server side
        if (tasks.length > 10 && list.attributes.title === Constants.ListTitles.done) {
            tasks = tasks.slice(0, 10);
        }

        return (
            <div id={"list-" + list.id} className="list">
                <div className="list-top">
                    <h2 className="no-margin">{Constants.ListTitleDisplay[this.props.name]}</h2>
                    { this.props.disable.create ? null : createButton }
                </div>
                <div className={"list-bottom " + 'list-' + this.props.name} ref="list">
                    {this.state.isCreateShown ? taskCreateBox : null }
                    {list.attributes.tasks.length === 0 && list.attributes.title === Constants.ListTitles.tasks ? taskDescription : null}
                    {list.attributes.tasks.length === 0 && list.attributes.title === Constants.ListTitles.tomorrow ? tomorrowDescription : null}
                    {list.attributes.tasks.length === 0 && list.attributes.title === Constants.ListTitles.today ? todayDescription : null}
                    {list.attributes.tasks.length === 0 && list.attributes.title === Constants.ListTitles.done ? doneDescription : null}
                    {tasks.map((task) => {
                        return <Task uid={this.props.uid} lists={this.props.lists} list={list} task={task} key={task.id} disable={this.props.disable} />;
                    })}
                </div>
                <div className={"list-cap"}></div>
            </div>
        )
    }
}

export default List;