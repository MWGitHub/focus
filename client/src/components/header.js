import React from 'react';
import Router from 'react-router';
import Routes from '../constants/routes';
import AuthStore from '../stores/AuthStore';

class Nav extends React.Component {
    render() {
        "use strict";
        if (this.props.authenticated) {
            return (
                <div>
                    <ul>
                        <li><Router.Link to="/">Home</Router.Link></li>
                        <li><Router.Link to={Routes.board}>Board</Router.Link></li>
                        <li><Router.Link to={Routes.logout}>Log Out</Router.Link></li>
                    </ul>
                </div>
            )
        } else {
            return (
                <div>
                    <ul>
                        <li><Router.Link to="/">Home</Router.Link></li>
                        <li><Router.Link to={Routes.register}>Register</Router.Link></li>
                        <li><Router.Link to={Routes.login}>Log In</Router.Link></li>
                    </ul>
                </div>
            )
        }
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: AuthStore.isLoggedIn()
        };
    }

    _onChange() {
        this.setState({
            isLoggedIn: AuthStore.isLoggedIn()
        });
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
            <header id="header">
                <h1>Focus</h1>
                <Nav authenticated={this.state.isLoggedIn} />
            </header>
        );
    }
}

export default Header;