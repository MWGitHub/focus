import API from '../utils/api';
import React from 'react';
import RegisterActions from '../actions/RegisterActions';
import AuthStore from '../stores/AuthStore';
import RouterUtil from '../utils/RouterUtil';
import LoginActions from '../actions/LoginActions';

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showGenericError: false,
            showUsernameTaken: false,
            showUsernameShort: false,
            showUsernameLong: false,
            showUsernameIllegal: false,
            showPasswordDifferent: false,
            showPasswordShort: false
        };
    }

    _registerError(err) {
        this.setState({
            showGenericError: true
        });
    }

    handleSubmit(e) {
        "use strict";
        e.preventDefault();

        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value;
        var passwordCheck = React.findDOMNode(this.refs.passwordcheck).value;
        if (!username || !password || !passwordCheck) {
            return;
        }

        RegisterActions.register(username, password, this._registerError.bind(this));
    }

    render() {
        "use strict";
        return (
            <div>
                <form className="register-form" onSubmit={this.handleSubmit.bind(this)}>
                    <label htmlFor="register-username">Username</label>
                    <input id="register-username" type="text" ref="username" placeholder="e.g. johndoe" autofocus required />

                    <label htmlFor="register-password">Password</label>
                    <input id="register-password" type="password" ref="password" required />

                    <label htmlFor="register-password-check">Password again</label>
                    <input id="register-password-check" type="password" ref="passwordcheck" required />

                    <input type="submit" value="Submit" />
                </form>
                { this.state.showGenericError ? <p>An error has occurred, registration failed.</p> : null }
            </div>
        )
    }
}

class RegisterBox extends React.Component {
    /**
     * Go back to the main page if already logged in.
     * @param transition
     */
    static willTransitionTo(transition) {
        if (AuthStore.isLoggedIn()) {
            transition.redirect('/');
        }
    }

    constructor() {
        super();
    }

    _onChange() {
        // Go back to the index if already logged in
        if (AuthStore.isLoggedIn()) {
            RouterUtil.transitionTo('/');
        }
    }

    componentDidMount() {
        this.listener = this._onChange.bind(this);
        AuthStore.addChangeListener(this.listener);
    }

    componentWillUnmount() {
        AuthStore.removeChangeListener(this.listener);
    }

    render() {
        "use strict";

        return (
            <div className="register-box">
                <RegisterForm />
            </div>
        )
    }
}

export default RegisterBox;