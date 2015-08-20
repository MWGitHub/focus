import React from 'react';
import Router from 'react-router';
import RouterUtil from './utils/RouterUtil';
import Register from './components/register';
import Login from './components/login';
import Index from './components/Index';
import Routes from './constants/routes';
import Logout from './components/LogOut';
import Board from './components/Board';

var Route = Router.Route;
var routes = (
    <Route handler={Index} path="/">
        <Route name={Routes.register} path={Routes.register} handler={Register}/>
        <Route name={Routes.login} path={Routes.login + ':next?'} handler={Login}/>
        <Route name={Routes.logout} path={Routes.logout} handler={Logout}/>
        <Route name={Routes.board} path={Routes.board} handler={Board}/>
    </Route>
);

var router = Router.create({
    routes: routes,
    location: Router.HistoryLocation
});
RouterUtil.setRouter(router);

router.run((Root) => {
    "use strict";
    React.render(<Root/>, document.getElementById('content'));
});