import React from 'react';
import Router from 'react-router';
import Routes from '../constants/Routes';
import AuthStore from '../stores/AuthStore';
import UserStore from '../stores/UserStore';

class AuthNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuVisible: false
        }
    }

    _toggleMenu(e) {
        e.preventDefault();

        this.setState({
            isMenuVisible: !this.state.isMenuVisible
        });
    }

    render() {
        var visibilityFlag = this.state.isMenuVisible ? 'visible' : 'hidden';
        var menu = (
            <ul className={"nav-menu-content " + visibilityFlag}>
                <li><Router.Link to={Routes.board}>Board</Router.Link></li>
                <li><Router.Link to={Routes.logout}>Log Out</Router.Link></li>
            </ul>
        );

        return (
            <nav className="nav-menu">
                <a className="button" onClick={this._toggleMenu.bind(this)}>{this.props.username}</a>
                {menu}
            </nav>
        )
    }
}

class GuestNav extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <nav className="nav-menu container">
                <ul>
                    <li className="link-button"><Router.Link to={Routes.register} className="secondary-button">Register</Router.Link></li>
                    <li className="link-button"><Router.Link to={Routes.login} className="button">Sign In</Router.Link></li>
                </ul>
            </nav>
        )
    }
}

class Nav extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return this.props.authenticated ? <AuthNav username={this.props.username} /> : <GuestNav />;
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: AuthStore.isLoggedIn(),
            userData: UserStore.getData()
        };
    }

    _onChange() {
        this.setState({
            isLoggedIn: AuthStore.isLoggedIn(),
            userData: UserStore.getData()
        });
    }

    componentDidMount() {
        this.listener = this._onChange.bind(this);
        AuthStore.addChangeListener(this.listener);
        UserStore.addChangeListener(this.listener);
    }

    componentWillUnmount() {
        AuthStore.removeChangeListener(this.listener);
        UserStore.removeChangeListener(this.listener);
    }

    render() {
        "use strict";
        return (
            <header id="header" className="container">
                <div className="header-left">
                    <h2 className="no-margin"><Router.Link to="/">Focus</Router.Link></h2>
                </div>
                <div className="header-right">
                    <Nav authenticated={this.state.isLoggedIn}
                         username={this.state.userData ? this.state.userData.attributes.username : null} />
                </div>
            </header>
        );
    }
}

export default Header;