import API from '../utils/API';
import React from 'react';
import Router from 'react-router';

import Header from './Header';
import Footer from './Footer';

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