import API from '../utils/API';
import React from 'react';
import Router from 'react-router';
import AuthStore from '../stores/AuthStore';
import UserStore from '../stores/UserStore';
import Routes from '../constants/Routes';
import UserActions from '../actions/UserActions';

import Header from './Header';
import Footer from './Footer';
import Analytics from './Analytics';

class HomeLoggedIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userData: UserStore.getData()
        };
    }

    componentDidMount() {
        this.changeListener = this._onChange.bind(this);
        UserStore.addChangeListener(this.changeListener);

        UserActions.retrieve(AuthStore.getID(), false);
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.changeListener);
    }

    _onChange() {
        this.setState({
            userData: UserStore.getData()
        });
    }

    render() {
        if (!this.state.userData) {
            return (
                <div>
                    <h2>Loading...</h2>
                </div>
            )
        }

        var projects = [].concat(this.state.userData.attributes.projects);
        projects.sort(function(a, b) {
            if (a.id < b.id) {
                return -1;
            } else if (a.id > b.id) {
                return 1;
            }
            return 0;
        });
        return (
            <div className="group">
                <h1 className="page-title">Projects and Boards</h1>
                {projects.map(function(v) {
                    return (
                        <div className={'home-card home-project'} key={v.type + v.id}>
                            <Router.Link to={Routes.project} params={{id: v.id}}>
                                <span>{v.attributes.title}</span>
                            </Router.Link>
                        </div>
                    );
                })}
            </div>
        );
    }
}

class HomeGuest extends React.Component {
    render() {
        return (
            <div>
                Home page in development
            </div>
        );
    }
}

class Home extends React.Component {
    constructor() {
        super();

        this.state = {
            isLoggedIn: AuthStore.isLoggedIn()
        };
    }

    componentDidMount() {
        this.listener = this._onChange.bind(this);
        AuthStore.addChangeListener(this.listener);
    }

    componentWillUnmount() {
        AuthStore.removeChangeListener(this.listener);
    }

    _onChange () {
        this.setState({
            isLoggedIn: AuthStore.isLoggedIn()
        });
    }

    render() {
        return (
            <div>
                {this.state.isLoggedIn ? <HomeLoggedIn /> : <HomeGuest />}
            </div>
        );
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
        );
    }
}

class IndexFull extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div id="page">
                <Analytics />
                <div className="page-top">
                    <Header />
                    <section id="main">
                        <Router.RouteHandler/>
                    </section>
                </div>
                <Footer />
            </div>
        );
    }
}

class Base extends React.Component {
    render() {
        return (
            <Router.RouteHandler />
        );
    }
}

export default {
    Base: Base,
    IndexFull: IndexFull,
    IndexMinimal: IndexMinimal,
    Home: Home
};