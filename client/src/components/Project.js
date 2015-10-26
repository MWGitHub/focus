import React from 'react';
import BoardActions from '../actions/BoardActions';
import BoardStore from '../stores/BoardStore';
import RouterUtil from '../utils/RouterUtil';
import API from '../utils/API';
import BoardComponent from '../workflows/focus/BoardComponent';

class Project extends React.Component {
    constructor(props) {
        super(props);

        var projectID = this.props.params.id;

        this.state = {
            project: BoardStore.getProjectData(projectID)
        };

        this._onChangeBound = this._onChange.bind(this);
    }

    _onChange() {
        this.setState({
            project: BoardStore.getProjectData(this.props.params.id)
        });
    }

    componentDidMount() {
        BoardStore.addChangeListener(this._onChangeBound);
        BoardActions.retrieveProject(this.props.params.id, true);
    }

    componentWillUnmount() {
        BoardStore.removeChangeListener(this._onChangeBound);
    }

    render() {
        if (this.state.project && this.state.project.attributes.boards.length > 0) {
            return (
                <BoardComponent pid={this.state.project.id} board={this.state.project.attributes.boards[0]} />
            )
        } else {
            return (
                <div>
                    <h2>Loading...</h2>
                </div>
            );
        }


    }
}

export default Project;