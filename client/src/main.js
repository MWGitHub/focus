import React from 'react';
import Router from 'react-router';
import RouterUtil from './utils/RouterUtil';
import Register from './components/Register';
import Login from './components/Login';
import Index from './components/Index';
import Routes from './constants/Routes';
import Logout from './components/LogOut';
import Board from './components/Board';
import AuthStore from './stores/AuthStore';
import config from '../config.json';

var Route = Router.Route;
var routes = (
    <Route handler={Index.Base}>
        <Route handler={Index.Index} path={config.root}>
            <Router.DefaultRoute handler={Index.Home} />
            <Route name={Routes.register} path={Routes.register} handler={Register}/>
            <Route name={Routes.login} path={Routes.login + ':next?'} handler={Login}/>
            <Route name={Routes.logout} path={Routes.logout} handler={Logout}/>
        </Route>
        <Route handler={Index.IndexMinimal}>
            <Route name={Routes.board} path={Routes.board} handler={Board}/>
        </Route>
    </Route>
);

var router = Router.create({
    routes: routes,
    location: Router.HistoryLocation
});
RouterUtil.setRouter(router);

// Load the auth if it exists
AuthStore.loadAuth(
    function success() {
        router.run((Root) => {
            React.render(<Root/>, document.getElementById('content'));
        });
    },
    function error() {
        router.run((Root) => {
            React.render(<Root/>, document.getElementById('content'));
        });
    });
