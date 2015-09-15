import Authenticator from './Authenticator';
import UserStore from '../stores/UserStore';
import AuthStore from '../stores/AuthStore';
import UserActions from '../actions/UserActions';
import React from 'react';
import Validate from '../utils/Validation';

class SettingsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showGenericError: false,
            passwordMessage: null,
            passwordCheckMessage: null
        }
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
            case 'change-password':
                message = Validate.password(value);
                this.setState({
                    passwordMessage: message
                });
                break;
            case 'change-password-check':
                var pw = React.findDOMNode(this.refs.password).value;
                if (!value || value !== pw) {
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
        var password = React.findDOMNode(this.refs.password);
        var passwordCheck = React.findDOMNode(this.refs.passwordcheck);
        if (password.value || passwordCheck.value) {
            if (this._validate(password.id, password.value)) {
                valid = false;
            }
            if (this._validate(passwordCheck.id, passwordCheck.value)) {
                valid = false;
            }
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
        this.setState({
            showGenericError: true
        });
    }

    handleSubmit(e) {
        "use strict";
        e.preventDefault();

        if (this._validateAll()) {
            var password = React.findDOMNode(this.refs.password).value;
            UserActions.update(this.props.uid, password, null, this._registerError.bind(this));
        }
    }

    wrapErrorMessage(m) {
        return <span className="error">{m}</span>;
    }

    render() {
        var passwordMessage = this.state.passwordMessage ? this.wrapErrorMessage(this.state.passwordMessage) : null;
        var passwordCheckMessage = this.state.passwordCheckMessage ? this.wrapErrorMessage(this.state.passwordCheckMessage) : null;

        "use strict";
        return (
            <div className="form-page">
                { this.state.showGenericError ? <p className="error">An error has occurred, settings unchanged.</p> : null }
                <form className="form" onSubmit={this.handleSubmit.bind(this)}>
                    <h3>Change Password</h3>
                    <div className={'form-item' + (passwordMessage ? ' error' : '')}>
                        <label htmlFor="change-password">New password{ passwordMessage }</label>
                        <input id="change-password" type="password" ref="password" required />
                    </div>

                    <div className={'form-item' + (passwordCheckMessage ? ' error' : '')}>
                        <label htmlFor="change-password-check">New password again{ passwordCheckMessage }</label>
                        <input id="change-password-check" type="password" ref="passwordcheck" required />
                    </div>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
}

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: UserStore.getData(),
            uid: AuthStore.getID()
        };
    }

    componentDidMount() {
        this.listener = this.onChange.bind(this);
        UserStore.addChangeListener(this.listener);

        UserActions.retrieveData(this.state.uid);
    }

    onChange() {
        this.setState({
            data: UserStore.getData(),
            uid: AuthStore.getID()
        });
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.listener);
    }

    render() {
        if (!this.state.data) return null;
        return (
            <SettingsView uid={this.state.uid} data={this.state.data} />
        );
    }
}

export default Authenticator(Settings);