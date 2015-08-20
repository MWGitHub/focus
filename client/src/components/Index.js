import API from '../utils/api';
import React from 'react';
import Router from 'react-router';

import Header from './header';
import Footer from './footer';

class Index extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div id="page">
                <Header />
                <div className="Main">
                    <Router.RouteHandler/>
                </div>
                <Footer />
            </div>
        )
    }
}

export default Index;