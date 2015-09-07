import API from '../utils/API';
import React from 'react';
import RegisterActions from '../actions/RegisterActions';
import AuthStore from '../stores/AuthStore';
import RouterUtil from '../utils/RouterUtil';
import LoginActions from '../actions/LoginActions';
import Validation from '../utils/Validation';

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showGenericError: false,
            usernameMessage: null,
            passwordMessage: null,
            passwordCheckMessage: null
        };
        this.onInputChange = this._onInputChange.bind(this);
    }

    /**
     * Validates an input field and sets the error message if invalid.
     * @param {String} id the id of the field.
     * @param {String} value the value to validate.
     * @private
     */
    _validate(id, value) {
        var message = null;
        switch(id) {
            case 'register-username':
                message = Validation.username(value);
                this.setState({
                    usernameMessage: message
                });
                break;
            case 'register-password':
                message = Validation.password(value);
                this.setState({
                    passwordMessage: message
                });
                break;
            case 'register-password-check':
                if (!value || value !== React.findDOMNode(this.refs.password).value) {
                    message = 'must match the password';
                }
                this.setState({
                    passwordCheckMessage: message
                });
                break;
        }
        return message;
    }

    /**
     * Checks all form fields and returns true if valid, false otherwise.
     * Does not check duplicate user names.
     * @returns {boolean} true if valid or false if not.
     * @private
     */
    _validateAll() {
        var valid = true;
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            var message = this._validate(inputs[i].id, inputs[i].value);
            if (message) valid = false;
        }

        return valid;
    }

    _onInputChange(e) {
        this._validate(e.target.id, e.target.value);
    }

    componentDidMount() {
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('change', this.onInputChange);
        }
    }

    componentWillUnmount() {
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].removeEventListener('change', this.onInputChange);
        }
    }

    _registerError(err) {
        if (err.status === API.status.register.usernameTaken) {
            this.setState({
                usernameMessage: 'username is already taken'
            });
        } else {
            this.setState({
                showGenericError: true
            });
        }
    }

    handleSubmit(e) {
        "use strict";
        e.preventDefault();

        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value;
        var passwordCheck = React.findDOMNode(this.refs.passwordcheck).value;

        if (this._validateAll()) {
            RegisterActions.register(username, password, this._registerError.bind(this));
        }
    }

    wrapErrorMessage(m) {
        return <span className="error">{m}</span>;
    }

    render() {
        var usernameMessage = this.state.usernameMessage ? this.wrapErrorMessage(this.state.usernameMessage) : null;
        var passwordMessage = this.state.passwordMessage ? this.wrapErrorMessage(this.state.passwordMessage) : null;
        var passwordCheckMessage = this.state.passwordCheckMessage ? this.wrapErrorMessage(this.state.passwordCheckMessage) : null;

        "use strict";
        return (
            <div>
                { this.state.showGenericError ? <p className="error">An error has occurred, registration failed.</p> : null }
                <form className="form" onSubmit={this.handleSubmit.bind(this)}>
                    <div className={'form-item' + (usernameMessage ? ' error' : '')}>
                        <label htmlFor="register-username">Username{ usernameMessage }</label>
                        <input id="register-username" type="text" ref="username" placeholder="e.g. johndoe" autofocus required />
                    </div>

                    <div className={'form-item' + (passwordMessage ? ' error' : '')}>
                        <label htmlFor="register-password">Password{ passwordMessage }</label>
                        <input id="register-password" type="password" ref="password" required />
                    </div>

                    <div className={'form-item' + (passwordCheckMessage ? ' error' : '')}>
                        <label htmlFor="register-password-check">Password again{ passwordCheckMessage }</label>
                        <input id="register-password-check" type="password" ref="passwordcheck" required />
                    </div>
                    <input type="submit" value="Submit" />
                </form>
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
            <div className="form-page">
                <h2>Create an Account</h2>
                <RegisterForm />
            </div>
        )
    }
}

export default RegisterBox;