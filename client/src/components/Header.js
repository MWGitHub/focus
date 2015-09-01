import React from 'react';
import Router from 'react-router';
import Routes from '../constants/Routes';
import AuthStore from '../stores/AuthStore';

class AuthNav extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <nav className="nav-menu" ref="menu">
                <p>menu</p>
                <ul className="nav-menu-content" ref="navMenuContent">
                    <li><Router.Link to={Routes.board}>Board</Router.Link></li>
                    <li><Router.Link to={Routes.logout}>Log Out</Router.Link></li>
                </ul>
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
            <nav className="nav-menu container" ref="menu">
                <ul>
                    <li className="link-button"><Router.Link to={Routes.register}>Sign Up</Router.Link></li>
                    <li className="link-button"><Router.Link to={Routes.login}>Sign In</Router.Link></li>
                </ul>
            </nav>
        )
    }
}

class Nav extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        //var nav = React.findDOMNode(this.ref.menu);
        //var content = React.findDOMNode(this.ref.navMenuContent);

        /*
        nav.addEventListener('click', function(e) {
            console.log(content.style);
        });
        console.log(nav);
        */
    }

    render() {
        return this.props.authenticated ? <AuthNav /> : <GuestNav />;
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
            <header id="header" className="container">
                <div className="header-left">
                    <h2 className="no-margin"><Router.Link to="/">Focus</Router.Link></h2>
                </div>
                <div className="header-right">
                    <Nav authenticated={this.state.isLoggedIn} />
                </div>
            </header>
        );
    }
}

export default Header;