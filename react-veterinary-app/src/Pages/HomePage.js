import React, {Component} from 'react';
import { medicService } from '../services/medic.service';
import {auth} from 'firebase';
import { format, fromUnixTime } from 'date-fns';
import { Card, Form, Col, Button, Modal, Toast } from 'react-bootstrap';
import '../components/stylingComponents/Appointments.css';
import { faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PopoverHeader, PopoverBody,Popover } from 'reactstrap';
import { Document,StyleSheet,View,Text,PDFDownloadLink,Page, Image } from '@react-pdf/renderer';
import logo from '../Logo.png';
import ReactSignatureCanvas from 'react-signature-canvas';

const styles = StyleSheet.create({
    page: {
      flexDirection: 'col',
      backgroundColor: '#E4E4E4'
    },
    section: {
      margin: 10,
      padding: 5,
      fontSize: 15,
      backgroundColor: "#777",
    },
    image: {
        width: 150,
        height: 150,
        position: "absolute",
        right: 0,
        bottom: 0,
    },
    signature: {
        width: 25,
        height: 25,
    },
    title: {
        fontSize: 40,
        textAlign: "center"
    },
    description: {
        flexDirection: "row",
        margin: 10,
        padding: 5,
        fontSize: 15,
        backgroundColor: "#777",  
    }
  });

// receipt pdf template
const Receipt = props => (
    <Document>
    <Page size="A4" style={styles.page}>
    <View style={styles.title}>
        <Text style={{marginTop:"5"}}> Reteta </Text>
    </View>
    <Text style={{fontSize:"20",marginTop:"20",marginLeft:"10"}}>Date client</Text>
    <View style={styles.section}>  
        <Text style={{margin:"5"}}>Nume client: {props.data.clientName}</Text>
        <Text style={{margin:"5"}}>Adresa: {props.data.adress}</Text>
        <Text style={{margin:"5"}}>Judet: {props.data.state}</Text>
    </View>
    <Text style={{fontSize:"20",marginTop:"40",marginBottom:"5",marginLeft:"10"}}>Date amimal</Text>
    <View style={styles.description}>
        <View style={{padding:"10",margin:"10",}}>
            <Text style={{margin:"5"}}>Nume animal: {props.data.animalName}</Text>
            <Text style={{margin:"5"}}>Greutate: {props.data.weight} kg</Text>
        </View>
        <View style={{padding:"10",margin:"10",}}>
            <Text style={{margin:"5"}}>Rasa: {props.data.breed}</Text> 
            <Text style={{margin:"5"}}>Specie: {props.data.species}</Text> 
        </View>
    </View>
    <Text style={{fontSize:"20",marginTop:"60",marginBottom:"5",marginLeft:"10"}}>Medicamente</Text>
    <View style={styles.description}>
            {props.data.addMeds.map(med => 
            <View style={{padding:"3",margin:"3",}}>
                <Text style={{margin:"5"}}>Medicament: {med.medName}</Text>
                <Text style={{margin:"5"}}>A se repeta: {med.medRepeats} pe zi</Text>
                <Text style={{margin:"5"}}>Cantitate: {med.medQuantity}</Text>
            </View>
            )}
    </View>
    <View style={styles.description}>
        <View style={{padding:"10",margin:"10",}}>
            <Text style={{margin:"5"}}>Medic: {props.data.medicName}</Text>
        </View>
        <View style={{padding:"10",margin:"10",}}>
            <Text style={{margin:"5"}}>Semnatura: </Text>  
        </View>
        <View style={{padding:"10",margin:"10",}}>
            <Image src={props.data.signature} style={styles.signature}/>
        </View>
                    
    </View>
        <Image src={logo} style={styles.image}/>
    </Page>
</Document>
)

export class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            medic: null,
            loading: false,
            upcomingAppointments: [],
            notifications:[],
            medsAdded:[],
            showAddMedsModal:false,
            showMedsInfo:false,
            // receipt data
            clientName:null,
            animalName:null,
            adress:null,
            weight:null,
            species:"Caine",
            breed:null,
            state:null,
            receiptData:null,
            signature:null,
            // errors
            errors:{},
        };
        this.showMedsModal = this.showMedsModal.bind(this);
        this.saveMed = this.saveMed.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.generateReceipt = this.generateReceipt.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    // data fetching methods
    async componentDidMount()
    {
        if(auth().currentUser !==null)
        {
            let medicLoggedId = null;
            if(auth().currentUser.uid !== null)
            {
                medicLoggedId = auth().currentUser.uid;
            }
            console.log(medicLoggedId);
            if(medicLoggedId !== null)
            {
                let medicLogged = await medicService.getMedicData();
                console.log(medicLogged);
                this.setState({ 
                    medic: medicLogged,
                    loading: false
                });
                this.populateTodayAppointments();
            }
            
        }
        else{
            console.log("User not logged in.");
        }
        
    }

    async populateTodayAppointments(){
        let today = new Date();
        if(auth().currentUser !== null)
            await medicService.getAppointments(today).then(appointments => this.setState({upcomingAppointments:appointments}))
    }


    // render methods
    renderUpcomingAppointments(){
        let cards = [];
        if(this.state.upcomingAppointments.length>0){
        this.state.upcomingAppointments.map(appointment => {
            let convertedDate = format(fromUnixTime(appointment.startTime.seconds),"H:mm a");
            cards.push(
                <Card bg='info' key={appointment.Id} style={{width:'18rem',height:'8rem',marginBottom:'10px'}}>
                    <Card.Header>La ora {convertedDate}</Card.Header>
                    <Card.Body>
                        <Card.Title as='h6'>Programare - {appointment.animalName}</Card.Title>
                        <Card.Text>
                        Tipul programarii: {appointment.type}.
                        </Card.Text>
                    </Card.Body>
                </Card>);
            })
        }
        else{
            cards.push(<h4>Nici-o programare azi momentan.</h4>);
        }
        return cards;
    }

    showMedsModal(){
        console.log("Showing modal");
        this.setState({showAddMedsModal:true});
    }

    saveMed(med){
        let meds = this.state.medsAdded;
        meds.push(med);
        this.setState({medsAdded:meds,showAddMedsModal:false})
    }

    arrayRemove(arr,value){
        return arr.filter((elem) => {
            return elem.medName != value;
        })
    }

    renderMedsInfo(){
        let toasts = []
        let meds = this.state.medsAdded;
        meds.map( med => {
            toasts.push(
                <Toast id={med.medName} onClose={() => {
                    meds = this.arrayRemove(meds,med.medName);
                    this.setState({medsAdded:meds});
                }}>
                <Toast.Header>
                    {med.medName}
                </Toast.Header>
                <Toast.Body>Cantitate:{med.medQuantity}, {med.medRepeats} pe zi.</Toast.Body>
                </Toast>
            )
        });
        return toasts;
    }

    handleChange(e){
        const {name,value} = e.target;
        this.setState({[name]:value});
    }

    generateReceipt(){
        if(!this.validateForm())
        {
            return;
        }
        if(this.state.medsAdded.length < 1){
            alert("Va rugam adaugati medicamente!");
            return;
        }
        const {clientName,animalName,adress,weight,species,breed,state} = this.state;
        let trimmedSignature = this.sigPad.getTrimmedCanvas();
        const medicName = this.state.medic.FirstName + ", " + this.state.medic.LastName;

        const receiptData = {
            clientName:clientName,
            animalName:animalName,
            adress:adress,
            weight:weight,
            breed:breed,
            state:state,
            species:species,
            addMeds:this.state.medsAdded,
            signature:trimmedSignature.toDataURL(),
            medicName:medicName,
        };

        console.log(trimmedSignature.toDataURL());
        this.setState({receiptData:receiptData});
    }

    sigPad = {};


    validateForm(){
        let errors = {};
        let isValid = true;

        if(this.state.clientName < 1)
        {
            errors["clientName"] = "Va rugam introduceti numele clientului!"
            isValid = false;
        }
        if(this.state.adress < 1)
        {
            errors["adress"] = "Va rugam introduceti adresa clientului!"
            isValid = false;
        }
        if(this.state.animalName < 1)
        {
            errors["animalName"] = "Va rugam introduceti numele animalului!"
            isValid = false;
        }
        if(this.state.state < 1)
        {
            errors["state"] = "Va rugam introduceti judetul!"
            isValid = false;
        }
        if(this.state.breed < 1)
        {
            errors["breed"] = "Va rugam introduceti rasa animalului!"
            isValid = false;
        }
        if(this.state.weight < 1)
        {
            errors["weight"] = "Va rugam introduceti un numar pozitiv!"
            isValid = false;
        }

        this.setState({errors:errors});
        return isValid;
    }


    renderReceiptForm(){
        let medsInfoToasts = this.renderMedsInfo();
        return(
            <Form>
                <Form.Row>
                    <Form.Group as={Col}>
                        <Form.Label>Nume client</Form.Label>
                        <Form.Control type="text" name="clientName" value={this.state.clientName} placeholder="Georgescu Vasile.."
                            onChange={this.handleChange}></Form.Control>
                        <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["clientName"]}</b></span>
                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label>Nume animal</Form.Label>
                        <Form.Control type="text" placeholder="Rex.." name="animalName" value={this.state.animalName}
                        onChange={this.handleChange}></Form.Control>
                        <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["animalName"]}</b></span>
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Col xs={8}>
                        <Form.Label>Adresa</Form.Label>
                        <Form.Control type="text" name="adress" value={this.state.adress} placeholder="Str ..."
                            onChange={this.handleChange}
                        />
                        <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["adress"]}</b></span>
                    </Col>
                    <Col>
                        <Form.Label>Judet</Form.Label>
                        <Form.Control type="text" name="state" value={this.state.state} placeholder="Timis"
                            onChange={this.handleChange}
                        />
                        <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["state"]}</b></span>
                    </Col>
                </Form.Row>
                <Form.Row>
                    <Col>
                        <Form.Label>Specie</Form.Label>
                        <Form.Control as="select" name="species" value={this.state.species} onChange={this.handleChange}>
                            <option value="Caine">Caine</option>
                            <option value="Pisica">Pisica</option>
                        </Form.Control>
                    </Col>
                    <Col>
                        <Form.Label>Rasa</Form.Label>
                        <Form.Control type="text" name="breed" value={this.state.breed} onChange={this.handleChange}
                         placeholder="Labrador.."/>
                         <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["breed"]}</b></span>
                    </Col>
                    <Col>
                        <Form.Label>Greutate</Form.Label>
                        <Form.Control type="number" name="weight" value={this.state.weight} onChange={this.handleChange}
                         placeholder="10kg"/>
                         <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["weight"]}</b></span>
                    </Col>
                </Form.Row>
                <hr className="my-4"/>
                <Form.Row>
                    <Col xs={4}>
                        <Button className="btn" variant="primary" onClick={this.showMedsModal}>Adauga medicament</Button>
                    </Col>
                    <Col>
                        <btn className="btn btn-primary" id="medsInfo" onClick={() => {
                            (this.state.showMedsInfo) ? this.setState({showMedsInfo:false}) : this.setState({showMedsInfo:true});
                        }}>Medicamente adaugate: {this.state.medsAdded.length}</btn>
                    </Col>
                </Form.Row>
                <hr className="my-3"/>
                <Form.Row>
                    <Col>
                        <Form.Row>
                            <Button className="btn-secondary" style={{margin:"auto"}} onClick={() => this.sigPad.clear()}>Reseteaza semnatura</Button>  
                        </Form.Row>
                        <Form.Row>
                        <div style={{width:"200px",height:"100px",borderStyle:"solid",margin:"auto",marginTop:"1%"}}>
                            <ReactSignatureCanvas
                                penColor="black"
                                canvasProps={{width:"200px",height:"100px",className:"sigCanvas"}}
                                ref={(ref) => {this.sigPad = ref}}
                            >
                            </ReactSignatureCanvas>
                        </div>
                        </Form.Row>
                    </Col>
                    <Col>
                        <Button className="btn" variant="success" style={{width:"40%",height:"40%",margin:"auto",marginTop:"10%",display:"block"}}
                        onClick={this.generateReceipt}>Genereaza reteta</Button>
                    </Col>
                </Form.Row>
                <Popover placement="bottom" isOpen={this.state.showMedsInfo} target="medsInfo">
                            <PopoverHeader>Medicamente adaugate</PopoverHeader>
                            <PopoverBody>
                                {(medsInfoToasts.length > 0) ? medsInfoToasts : "Nici-un medicament adaugat"}
                            </PopoverBody>
              </Popover>
            </Form>
        )
    }

    render() {
        
        let appointments = this.renderUpcomingAppointments();
        let modalClose = () => this.setState({showAddMedsModal:false});

        return(
            <div>
                <div className="upcoming-appointments">
                <Card bg="light" border="dark">
                    <Card.Header>Programarile de azi</Card.Header>
                        <Card.Body className="scroll">
                            {appointments}
                        </Card.Body>
                </Card>
                </div>
                <div className="jumbotron" style={{float:"right",width:"67%",marginRight:"2%"}}>
                    <h3 className="display-6 text-left">Genereaza reteta</h3>
                    <hr className="my-2"/>
                    {this.renderReceiptForm()}
                    {(this.state.receiptData !== null) ?
                        <PDFDownloadLink className="col-sm" document={<Receipt data={this.state.receiptData} />} 
                                fileName="test">
                            {({ blob, url, loading, error }) => (loading ? 'Incarcare document...' : 'Descarca acum!')}
                        </PDFDownloadLink> : ""
                    }
                </div>
                <AddMedsModal
                    onHide={modalClose}
                    show={this.state.showAddMedsModal}
                    addMed={this.saveMed}
                />
            </div>
        );
    }
}

export default class AddMedsModal extends Component{
    constructor(props){
        super(props);
        this.state = {
            medName:null,
            medRepeats:null,
            medQuantity:null,
            errors:{},
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    handleSave(){
        if(!this.validateForm())
        {
            return;
        }
        const med = this.state;
        console.log(med);

        this.props.addMed(med);
    }
    
    handleChange(e){
        const {name,value} = e.target;
        this.setState({[name]:value});
    }

    validateForm(){
        let isValid = true;
        let errors = {};

        if(this.state.medName < 1){
            errors["medName"] = "Va rugam introduceti numele medicamentului!";
            isValid = false;
        }
        if(this.state.medQuantity < 1)
        {
            errors["medQuantity"] = "Va rugam introduceti cantitatea!";
            isValid = false;
        }
        if(this.state.medRepeats < 1)
        {
            errors["medRepeats"] = "Va rugam introduceti un numar pozitiv!";
            isValid = false;
        }

        this.setState({errors:errors});
        return isValid;
    }
    
    render(){
        return(
            <Modal {...this.props}>
                <Modal.Header closeButton>
                    <Modal.Title>Adauga medicament</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Medicament</Form.Label>
                            <Form.Control type="text" name="medName" value={this.state.medName} placeholder="parasinus"
                                onChange={this.handleChange}
                            />
                            <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["medName"]}</b></span>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>A se repeta( pe zi)</Form.Label>
                            <Form.Control type="number" name="medRepeats" placeholder="1" value={this.state.medRepeats}
                                onChange={this.handleChange}
                            />
                            <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["medRepeats"]}</b></span>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Cantitate</Form.Label>
                            <Form.Control type="text" name="medQuantity" placeholder="150 ml/g" value={this.state.medQuantity}
                                onChange={this.handleChange}
                            />
                            <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["medQuantity"]}</b></span>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.onHide}>
                        Inchide
                    </Button>
                    <Button variant="primary" onClick={this.handleSave}>
                        Adauga
                    </Button>
                </Modal.Footer>
            </Modal>    
        )
    }
}