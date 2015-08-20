import React from 'react';
import AuthStore from '../stores/AuthStore';
import Authenticator from './Authenticator';

class BoardView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
            </div>
        )
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <BoardView/>
            </div>
        )
    }
}

export default Authenticator(Board);