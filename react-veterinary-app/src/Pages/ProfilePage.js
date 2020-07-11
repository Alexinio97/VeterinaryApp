import React,{Component} from 'react';
import { storage } from '../firebaseConfig/config';
import { medicService } from '../services/medic.service';
import { Card, Form, Alert, Image, Modal } from 'react-bootstrap';
import {Badge} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt,faCamera} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { auth } from 'firebase';

export class ProfilePage extends Component{
    constructor(props){
        super(props);
        this.state = {
            medicLogged: null,
            imgUrl: null,
            edit:true,
            // data to update
            email:null,
            start:null,
            end:null,
            phone:null,
            photo:null,
            successUpdate: null,
            showPhotoModal: false,
            errors:{},
        }
        this.handleChange = this.handleChange.bind(this);
        this.handlePhotoSave = this.handlePhotoSave.bind(this);
    }

    async componentDidMount(){
        this.populateMedicData();
    }

    async populateMedicData(){
        await medicService.getMedicData().then( medic => this.setState({
            medicLogged:medic,
            email:medic.Email,
            start:medic.Schedule.start,
            end:medic.Schedule.end,
            phone:medic.Phone,
        }));
        await this.getMedicPhoto(this.state.medicLogged.Photo);
        
    }

    async getMedicPhoto(photoName){
        if(photoName !== null)
        {
            console.log(photoName);
            return storage.ref().child(`medicsProfilePic/${photoName}`).getDownloadURL().then( url =>
                {
                    this.setState({imgUrl:url});
                })
            .catch(error => console.log("Error caught: " + error.message));
        }
        else
        {
            console.log("Else branch");
            return "No photo!";
        }
    }

    handleEdit(e){
        if(this.state.edit === true){
                this.setState({edit:false});
        }
        else{ 
          this.setState({
                edit:true,
                email:this.state.medicLogged.Email,
                start:this.state.medicLogged.Schedule.start,
                end:this.state.medicLogged.Schedule.end,
                phone:this.state.medicLogged.Phone,
                errors:{},
            });
        }
    }

    handleChange(e){
        console.log(e);
        const { name,value } = e.target;
        this.setState({[name]:value})
    }

    validateForm(medic){
        let errors ={};
        let isValid = true;
        // regex for easier validation
        let emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let scheduleRegEx = new RegExp("([0-2][0-9]:[0-5]{2})$");
        let phoneRegEx = new RegExp("([0-9]{10})$");

        if(emailRegEx.test(medic.Email) === false){
            errors["email"] = "Adaugati o adresa de mail corecta.";
            isValid = false;
        }  
        if(scheduleRegEx.test(medic.Schedule.start) === false){
            errors["start"] = "Va rugam adaugati o ora valida.(exemplu 08:00)";
            isValid = false;
        }
        let result = scheduleRegEx.test(medic.Schedule.end);
        if(result === false){
            errors["end"] = "Va rugam adaugati o ora valida.(exemplu 08:00)";
            isValid = false;
        }

        if(phoneRegEx.test(medic.Phone) === false){
            errors["phone"] = "Va rugam adaugati un numar de telefon valid!";
            isValid = false;
        }



        this.setState({errors:errors});
        return isValid;
    }
    async handleSave(e){
        const medic = {
            Email:this.state.email,
            Schedule:{start:this.state.start,end:this.state.end},
            Phone:this.state.phone,
        }
        
        let result = this.validateForm(medic);
        if(result === false)
        {
            return;
        }
        console.log("Medic program",medic.Schedule)
        await medicService.UpdateMedic(medic).then(medic => this.setState({successUpdate:true}))
                .catch(err => {
                    this.setState({successUpdate:false});
                    console.error("Error caught ",err);
                });
        let user = auth().currentUser;
        if(medic.Email !== user.email)
        {
            user.updateEmail(medic.Email).then(() => {
                console.log("Authentication mail updated.");
            }).catch(err => console.error("Error updating email: ",err));
            console.log("Setting edit to true.")
        }
        this.setState({edit:true});
    }

    async handlePhotoSave(photo){
        this.setState({showPhotoModal:false})
        await medicService.uploadMedicPhoto(photo,this.state.medicLogged.LastName +"" + this.state.medicLogged.FirstName);
        
        const medicPhoto = {Photo:this.state.medicLogged.LastName +"" + this.state.medicLogged.FirstName};
        await medicService.UpdateMedic(medicPhoto);
        await this.getMedicPhoto(this.state.medicLogged.LastName +"" + this.state.medicLogged.FirstName);
    }

    renderMedicProfile(){
        return(
            <div className="container jumbotron">
            <h1 className="display-6 text-left" style={{paddingLeft:"30px"}}>Profilul meu</h1>
            <div className="col">
                <div className="row">
                    <div className="col mb-3">
                        <Card>
                            <Card.Body>
                                <div className="e-profile">
                                    <div className="row">
                                        <div className="col-12 col-sm-auto mb-3">
                                            <div className="mx-auto" style={{width:'140px'}}>
                                                <div className="d-flex justify-content-center align-items-center rounded" style={{height: '140px', backgroundColor: "rgb(233, 236, 239)"}}>
                                                    {(this.state.imgUrl !== null) ? <Image src={this.state.imgUrl} rounded style={{width:"140px",height:"140px"}} />
                                                     : <span style={{color: "rgb(166, 168, 170)", font: 'bold 8pt Arial'}}>140x140</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col d-flex flex-column flex-sm-row justify-content-between mb-3">
                                            <div class="text-center text-sm-left mb-2 mb-sm-0">
                                                <h4 class="pt-sm-2 pb-1 mb-0 text-nowrap">{this.state.medicLogged.FirstName} {this.state.medicLogged.LastName}</h4>
                                                <p class="mb-0">{this.state.medicLogged.Email}</p>
                                                <div class="mt-2">
                                                    <button class="btn btn-primary"  type="button" onClick={() => this.setState({showPhotoModal:true})}>
                                                        <FontAwesomeIcon icon={faCamera}/>
                                                        <span> Schimba poza</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-center text-sm-right">
                                                <Badge>Medic</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <ul className="nav nav-tabs">
                                        <li className="nav-item"><a class="active nav-link">Personal</a></li>
                                    </ul>
                                    <div className="tab-content pt-3">
                                        <div className="tab-pane active">
                                            <Form>
                                                <div className="row">
                                                    <div className="col">
                                                        <div className="row">
                                                            <div className="col">
                                                                <Form.Group>
                                                                    <Form.Label>Prenume</Form.Label>
                                                                    <Form.Control plaintext readOnly name="firstName" placeholder="John"
                                                                                value={this.state.medicLogged.FirstName} className="text-center"/>  
                                                                </Form.Group>
                                                            </div>
                                                            <div className="col">
                                                                <Form.Group>
                                                                    <Form.Label>Nume</Form.Label>
                                                                    <Form.Control plaintext readOnly type="text" name="lastName" placeholder="Doe"
                                                                            value={this.state.medicLogged.LastName} className="text-center"/>
                                                                </Form.Group>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col">
                                                                <Form.Group>
                                                                    <Form.Label>Email</Form.Label>
                                                                    <Form.Control readOnly={this.state.edit} type="email" name="email" placeholder="something@example.com" value={this.state.email}
                                                                        onChange={this.handleChange}
                                                                    />
                                                                    <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["email"]}</b></span>
                                                                </Form.Group>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col">
                                                                <Form.Group>
                                                                    <Form.Label>Telefon</Form.Label>
                                                                    <Form.Control readOnly={this.state.edit} type="tel" name="phone" placeholder="0732..." value={this.state.phone}
                                                                            onChange={this.handleChange}
                                                                    />
                                                                    <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["phone"]}</b></span>
                                                                </Form.Group>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr class="my-4"/>
                                                <div className="row">
                                                    <div className="col-12 col-sm-6 ">
                                                        <div className="mb-2"><b>Program</b></div>
                                                        <div className="row">
                                                            <div className="col">
                                                                <Form.Group>
                                                                    <Form.Label>Ora deschidere</Form.Label>
                                                                    <Form.Control readOnly={this.state.edit} type="text" name="start" maxLength="6" placeholder="08:00"
                                                                                value={this.state.start}
                                                                                onChange={this.handleChange}
                                                                                />
                                                                    <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["start"]}</b></span>    
                                                                </Form.Group>
                                                            </div>
                                                        <div className="col">
                                                                <Form.Group>
                                                                    <Form.Label>Ora inchidere</Form.Label>
                                                                    <Form.Control readOnly={this.state.edit} type="text" name="end" maxLength="6" placeholder="16:30"
                                                                                value={this.state.end}
                                                                                onChange={this.handleChange}
                                                                                />   
                                                                    <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["end"]}</b></span>            
                                                                </Form.Group>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form>
                                            <div class="row">
                                                    {(this.state.edit === true) ? 
                                                    <div class="col d-flex justify-content-end col-auto">
                                                        <button class="btn btn-primary"  onClick={() => this.handleEdit()}>Editeaza</button>
                                                    </div>:
                                                    <div class="col d-flex justify-content-end col-md-auto">
                                                        <button class="btn btn-success"  onClick={() => this.handleSave()}>Salveaza modificari</button>
                                                    </div>
                                                    }
                                                    {(this.state.edit === false ) ? 
                                                    <div class="justify-content-end col-auto">
                                                        <button class="btn btn-danger" onClick={() => this.handleEdit()}>Anuleaza</button>
                                                    </div> :""
                                                    }
                                            </div>  
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-12 col-md-3 mb-3">
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="px-xl-3">
                                <Link to="/Logout"><button className="btn btn-block btn-secondary" >
                                    <FontAwesomeIcon icon={faSignOutAlt} size="lg"/><span> Iesire</span>
                                </button>
                                </Link>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
        )
    }

    render() {
        let modalClose = () => this.setState({showPhotoModal:false})
        let medicContent = (this.state.medicLogged !== null) ? this.renderMedicProfile() : "";
        let alert = (this.state.successUpdate) ? <Alert variant="success" onClose={() => this.setState({successUpdate:false})} dismissible dismissible>Actualizare efectuata cu succes!</Alert> : "";
        return(
            <div>
                {alert}
                {medicContent}
                <PhotoChange
                    handlePhotoSave={this.handlePhotoSave}
                    onHide={modalClose}
                    show={this.state.showPhotoModal}
                />
           </div>
        )
    }
}


export class PhotoChange extends Component{
    constructor(props){
        super(props)
        this.state={
            photo:null,
        }
        this.handleChangePhoto = this.handleChangePhoto.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    async handleSave(){
        this.props.handlePhotoSave(this.state.photo);
    }
    
    handleChangePhoto(e){
        if (e.target.files[0]) {
            const photo = e.target.files[0];
            this.setState(() => ({photo:photo }));
            console.log(this.state);
          }
    }

    render(){
        return(
            <Modal {...this.props} dialogClassName="profilePhotoModal">
            <Modal.Header closeButton>
            <Modal.Title>Alegeti o fotografie...</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div class="custom-file">
                <input type="file" class="custom-file-input" name="Photo" id="customFile" onChange={this.handleChangePhoto}/>
                <label class="custom-file-label" for="customFile">{(this.state.photo !== null) ?  this.state.photo.name 
                                    : "Alegeti fotografie..."}</label>
            </div>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={this.props.onHide} >
                Inchide
            </Button>
            <Button variant="primary" onClick={this.handleSave}>
                Salveaza
            </Button>
            </Modal.Footer>
        </Modal>
        )
    }
}