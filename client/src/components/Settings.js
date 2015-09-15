import Authenticator from './Authenticator';
import UserStore from '../stores/UserStore';
import AuthStore from '../stores/AuthStore';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: UserStore.getData(),
            uid: AuthStore.getID()
        };
    }

    componentDidMount() {
        this.listener = this.onChange.bind(this);
        UserStore.addChangeListener(this.listener);

        BoardActions.retrieveData(this.state.uid);
    }

    onChange() {
        this.setState({
            data: UserStore.getData(),
            uid: AuthStore.getID()
        });
    }

    componentWillUnmount() {
        UserStore.removeChangeListener(this.listener);
    }

    render() {
        if (!this.state.data) return null;
        return (
            <BoardView uid={this.state.uid} board={this.state.data.attributes.boards[0]} />
        )
    }
}

export default Authenticator(Settings);