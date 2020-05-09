import React, { Component } from 'react';
import './pageStyling/animalPage.css';
import { storage } from '../firebaseConfig/config';
import { Form, Spinner, Card,  Alert, Button, Modal } from 'react-bootstrap';
import { Col,Row} from 'react-bootstrap';
import { animalService } from '../services/animal.service';
import { format } from 'date-fns/esm';
import { fromUnixTime } from 'date-fns';
import MaterialTable, { MTableBody } from 'material-table';
import { InputAdornment, Input, Tooltip } from '@material-ui/core';
import { inventoryService } from '../services/inventory.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSyringe} from '@fortawesome/free-solid-svg-icons';
import { medicService } from '../services/medic.service';

export class AnimalPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            clientId:null,
            animal:null,
            loading:true,
            imgUrl:null,
            clientName:null,
            animalAppointments: [],
            meds:[],
            appointmentMeds:[],
            // meds state
            showMedsModal:false,
            rowData:null,
        }
        this.renderAnimalProfile = this.renderAnimalProfile.bind(this);
        this.getAnimalPhoto = this.getAnimalPhoto.bind(this);
    }

    async componentDidMount(){
        let propsReceived = this.props.location.state;
        console.log(propsReceived);
        await this.getAnimalPhoto(propsReceived.animal.Photo).then(url => {
            console.log(url);
            this.setState({animal: propsReceived.animal,
            clientId: propsReceived.clientId,
            clientName: propsReceived.clientName,
            loading:false,
            imgUrl:url,
        });
        });
        this.populateAnimalAppointments();
        this.populateMeds();
    } 

    async getAnimalPhoto(photoName){
        if(photoName !== null)
        {
            console.log(photoName);
            return storage.ref().child(`animalProfilePics/${photoName}`).getDownloadURL().then( url =>
                {
                    return url;
                })
            .catch(error => console.log("Error caught: " + error.message));
        }
        else
        {
            console.log("Else branch");
            return "No photo!";
        }
    }

    async populateAnimalAppointments(){
        await animalService.getAnimalAppointments(this.state.clientId,this.state.animal.Name)
                .then(appointments => this.setState({animalAppointments:appointments}));
    }

    async populateMeds(){
        await inventoryService.getInventoryItems().then(meds => this.setState({meds:meds}));
    }

    renderAnimalProfile(){
        
        return (
            <div class="profileData">
                    <Card>
                        <Card.Img variant="top" src={this.state.imgUrl} className="profilePhoto"/>
                        <Card.Body>
                        <Card.Title>{this.state.animal.Name}</Card.Title>
                    <Form className="jumbotron">
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                            Age:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly defaultValue={this.state.animal.Age} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                            Breed:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly defaultValue={this.state.animal.Breed} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                                Species:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly as="select" disabled="true" value={this.state.animal.Species}>
                                <option value='0'>Dog</option>
                                <option value='1'>Cat</option>
                            </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                                Neutered:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly as="select" disabled="true"  name="Neutered" value={this.state.animal.Neutered} >
                                <option value='0'>Yes</option>
                                <option value='1'>No</option>
                            </Form.Control>
                            </Col>
                        </Form.Group>
                        </Form>
                        </Card.Body>
                        </Card>
                </div>
        );
    }


    showMedsUsed(event,data){
        console.log(event);
        console.log(data);
        this.setState({rowData:data,showMedsModal:true});
    }
    


    renderAnimalHistoryMaterial(){
        const columns = [
            {title:'Date',field:'startTime',render: rowData => format(fromUnixTime(rowData.startTime.seconds),"dd/MM/yyyy"),editable:'never'},
            {title:'Appointment type',field:'type',editable:'never'},
            {title:'Price(€)',field:'price',type:'numeric'}
        ];
        return(
            <MaterialTable
            columns={columns}
            data={this.state.animalAppointments}
            title="Appointment history"
            actions={[
                {
                icon: 'save',
                tooltip: 'Meds used',
                onClick: (event, rowData) => this.showMedsUsed(event,rowData)
                }
            ]}
            components={{
                Action: props => (
                <Button
                    onClick={(event) => props.action.onClick(event, props.data)}
                    variant="contained"
                    style={{textTransform: 'none'}}
                    size="small"
                    title="Meds used"
                >
                    <FontAwesomeIcon icon={faSyringe} color="blue"/>
                </Button>
                )
            }}
            />
        )
    }

    render() {
        let appMedsModal = () => this.setState({showMedsModal:false})
        let profileData = this.state.loading ?  
            <Spinner animation="border" variant="primary"> 
                <span className="sr-only">Loading...</span>
            </Spinner> : this.renderAnimalProfile();
        console.log(this.state.animalAppointments.length);
        return (
            <div className="container">
                <ModalAppointmentMeds
                        show={this.state.showMedsModal}
                        onHide={appMedsModal}
                        rowData={this.state.rowData}
                        meds={this.state.meds}
                        />
                <div className="row">
                    <div className="col-4">{profileData}</div>
                    <div className="col-8">
                    {(this.state.animalAppointments.length > 0) ? this.renderAnimalHistoryMaterial() : <h3>This animal had no appointments yet.</h3>}
                    </div>
                </div>
            </div>
        )
    }
}


// separate class to handle meds used for each appointmets
// adds the posibility of adding multiple meds without re-rendering in an infinite loop
export class ModalAppointmentMeds extends Component{
    constructor(props){
        super(props)
        this.state = {
            appointmentMeds:[],
            meds:[],
            showAlert:false,
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.rowData !== this.props.rowData)
        {
            this.setState({meds:this.props.meds});
            this.populateAppointmentMeds(this.props.rowData.Id);
            console.log(this.state.meds);
        }
    }


    async populateAppointmentMeds(appId){
        await inventoryService.getMedsUsed(appId).then(medsApp =>this.setState({appointmentMeds:medsApp}));
    }

    getMedsLookup(){
        let meds = {}; // empty meds object for lookup in table
        this.state.meds.map(med => {
            let medName = med.name;
            meds[medName] = med.name;
        });
        return meds;
    }

    renderMedsTable(){
        let rowData = this.props.rowData;
        let medsLookUp = this.getMedsLookup();;    
        // populate meds for a specific appointment 
        
        const columns = [{title:'Medicine administrated',field:'med', lookup:medsLookUp},
            {title:'Quantity(g)',field:'quantity',type:'numeric',
            editComponent: props => (
                <Input
                endAdornment={<InputAdornment position="end">g</InputAdornment>}
                type="number"
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
                />
            )},
        ];
        return(
            <MaterialTable
            columns={columns}
            title="Meds used"
            style={{marginBottom:'10px'}}
            data={this.state.appointmentMeds}
            editable={{
                onRowUpdate: (newItem,oldItem) =>
                new Promise((resolve)=>
                setTimeout( async ()=>
                {
                    resolve();
                    this.state.meds.map(async med => {
                        if(med.name === newItem.med){
                            if(med.quantity < newItem.quantity){
                                this.setState({showAlert:true});
                            }
                            else{
                                await inventoryService.updateMedUsed(newItem,rowData.Id);
                                await this.populateAppointmentMeds(rowData.Id);
                            }
                        }
                    })
                },600)),
                onRowAdd: (newItem) => 
                new Promise((resolve)=>
                setTimeout(async () =>
                {
                    resolve();
                    this.state.meds.map(async med => {
                        if(med.name === newItem.med){
                            if(Number(med.quantity) < Number(newItem.quantity)){
                                this.setState({showAlert:true});
                            }
                            else{
                                await inventoryService.addMedsUsed(newItem,rowData.Id);
                                this.populateAppointmentMeds(rowData.Id);
                            }
                        }
                    })
                },600)
                ),
                onRowDelete:(oldItem) => 
                new Promise((resolve)=>
                setTimeout(()=>
                {
                    resolve();
                    inventoryService.deletMedUsed(oldItem,rowData.Id);
                    this.populateAppointmentMeds(rowData.Id);
                }))
            }}
            />
        )
    }
    
    renderAlert(message){
        return (
        <Alert variant="danger" onClose={() => this.setState({showAlert:false})} dismissible>
            {message}
        </Alert>
        );
    }

    render(){
        console.log(this.state.meds);
        return(
            <Modal {...this.props} dialogClassName="medsUsedModal" >
                <Modal.Header closeButton>
                    <Modal.Title>Medicine used</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        {(this.state.showAlert) ? this.renderAlert("Not enough meds on stock!") : ""}
                        {this.renderMedsTable()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}