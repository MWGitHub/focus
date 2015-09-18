import API from '../utils/API';
import React from 'react';
import Router from 'react-router';
import AuthStore from '../stores/AuthStore';
import Routes from '../constants/Routes';

import Header from './Header';
import Footer from './Footer';
import Analytics from './Analytics';

class Home extends React.Component {
    static willTransitionTo(transition) {
        if (AuthStore.isLoggedIn()) {
            transition.redirect(Routes.board, {});
        }
    }

    constructor() {
        super()
    }

    render() {
        return (
            <div>
                Info here
            </div>
        )
    }
}

class IndexMinimal extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div id="page">
                <Analytics />
                <Header />
                <section id="main">
                    <Router.RouteHandler/>
                </section>
            </div>
        )
    }
}

class Index extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div id="page">
                <Analytics />
                <div className="top">
                    <Header />
                    <section id="main">
                        <Router.RouteHandler/>
                    </section>
                </div>
                <Footer />
            </div>
        )
    }
}

class Base extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <Router.RouteHandler />
        )
    }
}

export default {
    Base: Base,
    Index: Index,
    IndexMinimal: IndexMinimal,
    Home: Home
};