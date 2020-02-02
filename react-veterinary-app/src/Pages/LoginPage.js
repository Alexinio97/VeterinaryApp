import React, {Component} from 'react';

import { userService } from '../services/user.service';
import {Card} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {faLock} from '@fortawesome/free-solid-svg-icons';

class LoginPage extends Component {
    constructor(props){
        super(props);
        userService.logout();

        this.state = {
            email: '',
            password: '',
            submitted: false,
            loading: false,
            error: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const { name,value } = e.target;
        this.setState({[name]: value});
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState({submitted: true});
        const {email,password,returnUrl} = this.state;

        if(!(email && password)){
            return;
        }

        this.setState({loading: true});
        userService.login(email,password)
        .then(
            user => {
                console.log(user); 
                const{from} = this.props.location.state || {from: {pathname: "/"}};
                this.props.history.push(from);
            },
            error => this.setState({error,loading: false})
        );
    }

    render() {
        const { email, password, submitted, loading, error } = this.state;

        return (
            <div className="align-self-center">
                <Card style={{width: "30rem",display: "flex",align: "center",justifyContent: "center",marginLeft: "auto",marginRight:"auto",marginTop: "15%"}}>
                <Card.Header className="card-title text-center mb-4 mt-1"><h4>Sign in</h4></Card.Header>
                <Card.Body>
                    <form name="form" onSubmit={this.handleSubmit}>
                        <div className={'form-group' + (submitted && !email ? ' has-error' : '')}>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} size={ "lg" } /></span>
                                </div>
                                <input type="text" className="form-control" name="email" value={email} onChange={this.handleChange} placeholder="Enter email"/>
                            </div>
                            {submitted && !email &&
                                <div className="help-block">Email is required!</div>
                            }
                            </div>
                            <div className={'form-group' + (submitted && !password ? ' has-error' : '')}>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><FontAwesomeIcon icon={faLock} size={ "lg" } /></span>
                                    </div>
                                    <input type="password" className="form-control" name="password" value={password} onChange={this.handleChange} placeholder="*****"/>
                                </div>
                            {submitted && !password &&
                                <div className="help-block">Password is required</div>
                            }
                        </div>
                        <div className="form-group">
                            <button className="btn btn-primary" disabled={loading}>Login</button>
                            {loading &&
                                <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                            }
                        </div>
                        {error &&
                            <div className={'alert alert-danger'}>{error}</div>
                        }
                    </form>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export {LoginPage};