import React from 'react';
import LoginActions from '../actions/LoginActions';
import AuthStore from '../stores/AuthStore';

/**
 * Component for logging the viewer out.
 */
class LogOut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: AuthStore.isLoggedIn()
        };
    }

    componentDidMount() {
        this.changeListener = this._onChange.bind(this);
        AuthStore.addChangeListener(this.changeListener);

        if (this.state.isLoggedIn) {
            LoginActions.logout();
        }
    }

    componentWillUnmount() {
        AuthStore.removeChangeListener(this.changeListener);
    }

    _onChange() {
        this.setState({
            isLoggedIn: AuthStore.isLoggedIn()
        });
    }

    render() {
        if (this.state.isLoggedIn) {
            return (
                <div>
                    <p>Logging out</p>
                </div>
            )
        }
        return (
            <div>
                <p>You have been logged out</p>
            </div>
        )
    }
}

export default LogOut;