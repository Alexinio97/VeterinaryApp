import React, {Component} from 'react';

import {Card} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {faLock} from '@fortawesome/free-solid-svg-icons';
import {authService} from '../helpers/auth';
import { Redirect } from 'react-router';
import { Spinner } from 'reactstrap';

export class LoginPage extends Component {

    constructor(props){
        super(props);
        this.state = {
            email: '',
            password: '',
            submitted: false,
            loading: false,
            error: '',
            redirect: false,
        };

        //this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // handleChange(e) {
    //     const { name,value } = e.target;
    //     this.setState({[name]: value});
    // }
    componentDidMount(){
        this.setState({redirect: this.props.authenticated});
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.authenticated !== this.props.authenticated){
            this.setState({redirect: this.props.authenticated});
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState({submitted: true});
        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        if(!(email && password)){
            return;
        }

        this.setState({loading: true});
        authService.login(email,password)
        .then(user => {
            this.loginForm.reset()
            this.props.setUserLoggedIn(user);
            this.setState({redirect: true});

        })
        .catch( errorM => 
            {
                console.log(errorM);
                authService.logout();
                this.setState({error:"Invalid email/password",loading:false});
            });
    }

    render() {
        const { from } = this.props.location.state || { from: { pathname: '/' } }
        if(this.state.redirect === true){
            return <Redirect to={from}/>
        }
        const { email, password, submitted, loading, error } = this.state;

        return (
            <div className="align-self-center">
                <Card style={{width: "30rem",display: "flex",align: "center",justifyContent: "center",marginLeft: "auto",marginRight:"auto",marginTop: "15%"}}>
                <Card.Header className="card-title text-center mb-4 mt-1"><h4>Sign in</h4></Card.Header>
                <Card.Body>
                    <form name="form" onSubmit={(event) => { this.handleSubmit(event) }} ref={(form) => { this.loginForm = form }}>
                        <div className={'form-group' + (submitted && !email ? ' has-error' : '')}>
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} size={ "lg" } /></span>
                                </div>
                                <input type="text" className="form-control" name="email" ref={(input) => { this.emailInput = input }} placeholder="Enter email"/>
                            </div>
                            {submitted && !this.emailInput &&
                                <div className="help-block">Email is required!</div>
                            }
                            </div>
                            <div className={'form-group' + (submitted && !password ? ' has-error' : '')}>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><FontAwesomeIcon icon={faLock} size={ "lg" } /></span>
                                    </div>
                                    <input type="password" className="form-control" name="password" ref={(input) => { this.passwordInput = input }} placeholder="*****"/>
                                </div>
                            {submitted && !this.passwordInput &&
                                <div className="help-block">Password is required</div>
                            }
                        </div>
                        <div className="form-group">
                            <button className="btn btn-primary" disabled={loading}>Login</button>
                            {loading &&
                                <Spinner animation="border" variant="primary"></Spinner>
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

