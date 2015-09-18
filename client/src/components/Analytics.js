import React from 'react';
import config from '../../config.json';

class Analytics extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        (function(i,s,o,g,r,a,m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {(i[r].q = i[r].q || []).push(arguments)}, i[r].l = 1 * new Date();
            a = s.createElement(o), m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', config.analyticsID, 'auto');
        ga('send', 'pageview');
    }

    render() {
        return (
            <div></div>
        );
    }
}

export default Analytics;