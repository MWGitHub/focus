import React from 'react';
import LoginActions from '../actions/LoginActions';
import AuthStore from '../stores/AuthStore';
import UserStore from '../stores/UserStore';
import RouterUtil from '../utils/RouterUtil';
import ROutes from '../constants/routes';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showGenericError: false
        };
    }

    _loginError(err) {
        console.log(err);
        this.setState({
            showGenericError: true
        });
    }

    handleSubmit(e) {
        "use strict";
        e.preventDefault();

        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value;
        if (!username || !password) {
            return;
        }

        LoginActions.login(username, password, this._loginError.bind(this));
    }

    render() {
        "use strict";
        return (
            <div>
                <form className="login-form" onSubmit={this.handleSubmit.bind(this)}>
                    <label htmlFor="login-username">Username</label>
                    <input id="login-username" type="text" ref="username" placeholder="e.g. johndoe" autofocus required />

                    <label htmlFor="login-password">Password</label>
                    <input id="login-password" type="password" ref="password" required />

                    <input type="submit" value="Submit" />
                </form>
                { this.state.showGenericError ? <p>wrong password</p> : null }
            </div>
        )
    }
}

class LoginBox extends React.Component {
    /**
     * Go back to the main page if already logged in.
     * @param transition
     */
    static willTransitionTo(transition) {
        if (AuthStore.getJWT()) {
            transition.redirect('/');
        }
    }

    constructor(props) {
        super(props);
        this.listener = null;
    }

    componentDidMount() {
        this.listener = this.onChange.bind(this);
        UserStore.addChangeListener(this.listener);
        AuthStore.addChangeListener(this.listener);
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.listener);
        AuthStore.removeChangeListener(this.listener);
    }

    onChange() {
        // Transition to the next page or the index once logged in
        if (AuthStore.isLoggedIn()) {
            if (this.props.query.next) {
                RouterUtil.transitionTo(this.props.query.next);
            } else {
                RouterUtil.transitionTo('/');
            }
        }
    }

    render() {
        "use strict";
        return (
            <div className="login-box">
                <LoginForm />
            </div>
        )
    }
}

export default LoginBox;