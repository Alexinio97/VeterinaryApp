import React, {Component} from 'react';
import { medicService } from '../services/medic.service';
import {Card, Form, Modal, Button, Alert} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {faLock} from '@fortawesome/free-solid-svg-icons';
import {authService} from '../helpers/auth';
import { Redirect } from 'react-router';
import { Spinner } from 'reactstrap';
import { auth } from 'firebase';


// TODO: check if the person that logs in is actually the medic!

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
            showResetModal:false,
            showAlert:false,
            success: false,
        };

        //this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.displayAlert = this.displayAlert.bind(this);
        this.handlePasswordReset = this.handlePasswordReset.bind(this);
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
        .then(async user => {
            let result = await medicService.getMedicData();
            if(result === undefined)
            {
                throw "Not a medic.";
            }
            //this.loginForm.reset()
            console.log(user);
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
    
    handlePasswordReset(email){
        auth().sendPasswordResetEmail(email).then(() => this.setState({showAlert:true,showResetModal:false,success:true}))
        .catch(err => {
            console.error("Error caught: ",err);
            this.setState({success:false,showAlert:true})
        });
    }

    displayAlert(){
        return(
            <div>
            {(this.state.success === true) ?
                <Alert variant="success" onClose={() => this.setState({showAlert:false})} dismissible>
                    <Alert.Heading>Am trimis email, va rugam verificati!</Alert.Heading>
                </Alert>
                :
                <Alert variant="danger" onClose={() => this.setState({showAlert:false})} dismissible>
                    <Alert.Heading>S-a produs o eroare la trimiterea mail-ului, incercati din nou!</Alert.Heading>
                </Alert>
            }
            </div>
        )
    }

    render() {
        let modalClose = () => this.setState({showResetModal:false});
        const { from } = this.props.location.state || { from: { pathname: '/' } }
        if(this.state.redirect === true){
            return <Redirect to={from}/>
        }
        const { email, password, submitted, loading, error } = this.state;

        return (
            <div className="align-self-center">
            {(this.state.showAlert) ? this.displayAlert() : ""}
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
                                <div className="help-block">Completati mail-ul!</div>
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
                                <div className="help-block">Parola este necesara!</div>
                            }
                        </div>
                        <div className="form-group">
                            <button className="btn btn-primary" disabled={loading}>Login</button>
                            {loading &&
                                <Spinner animation="border" variant="primary"></Spinner>
                            }
                        </div>
                        <div>
                            <button className="btn btn-primary" onClick={() => this.setState({showResetModal:true})}>Ati uitat parola?</button>
                        </div>
                        {error &&
                            <div className={'alert alert-danger'}>{error}</div>
                        }
                    </form>
                    </Card.Body>
                </Card>
                <ResetPasswordModal
                    onHide={modalClose}
                    show={this.state.showResetModal}
                    sendReset={this.handlePasswordReset}
                />
            </div>
        );
    }
}

export default class ResetPasswordModal extends Component {
    constructor(props){
        super(props);
        this.state={
            email:null,
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    handleChange(e){
        const { name,value } = e.target;
        this.setState({[name]: value});
    }

    handleSave(){
        this.props.sendReset(this.state.email);
    }

    render(){
        return(
            <Modal {...this.props} dialogClassName="appointmentModal">
            <Modal.Header closeButton>
            <Modal.Title>Recupereaza parola</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form.Group>
                <Form.Label>Email:</Form.Label>
                <Form.Control type="email" name="email" value={this.state.email}  onChange={this.handleChange}>
                </Form.Control>
            </Form.Group>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={this.props.onHide} >
                Close
            </Button>
            <Button variant="primary" onClick={this.handleSave}>
                Send
            </Button>
            </Modal.Footer>
        </Modal>
        )
    }
}

