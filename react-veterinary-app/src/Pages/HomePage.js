import React, {Component} from 'react';
import { Link } from 'react-router-dom';

import { userService } from '../services/user.service';

class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            users: []
        };
    }

    componentDidMount() {
        this.setState({ 
            user: JSON.parse(localStorage.getItem('user')),
            users: { loading: true }
        });
    }

    render() {
        const { user, users } = this.state;
        return (
            <div className="col-md-6 col-md-offset-3">
                <h1>Hi {user.firstName}!</h1>
                <p>You're logged in with React & Basic HTTP Authentication!!</p>
                <h3>Users from secure api end point:</h3>
                <p>
                    <Link to="/login">Logout</Link>
                </p>
            </div>
        );
    }
}

export {HomePage};