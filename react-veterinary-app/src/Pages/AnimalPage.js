import React, { Component } from 'react';
import './pageStyling/animalPage.css';
import { storage } from '../firebaseConfig/config';
import { Form, Spinner, Card,  Alert, Button, Modal, Tabs, Tab } from 'react-bootstrap';
import { Col,Row} from 'react-bootstrap';
import { animalService } from '../services/animal.service';
import { format } from 'date-fns/esm';
import { fromUnixTime } from 'date-fns';
import MaterialTable from 'material-table';
import { InputAdornment, Input } from '@material-ui/core';
import { inventoryService } from '../services/inventory.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSyringe,faFileInvoice, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image, pdf } from '@react-pdf/renderer';
import logo from '../Logo.png';
import { notifications } from '../helpers/notification';
import { medicService } from '../services/medic.service';

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

  const Invoice  = props =>(
    <Document>
        <Page size="A4" style={styles.page}>
        <View style={styles.title}>
            <Text style={{marginTop:"5"}}> Factura </Text>
        </View>
        <Text style={{fontSize:"20",marginTop:"70",marginLeft:"10"}}>Date facturare</Text>
        <View style={styles.section}>  
            <Text style={{margin:"5"}}>Nume animal: {props.data.animalName}</Text>
            <Text style={{margin:"5"}}>Nume client: {props.data.clientName}</Text>
            <Text style={{margin:"5"}}>Email client: {props.data.clientEmail}</Text>
            <Text style={{margin:"5"}}>Data: {format(fromUnixTime(props.data.startTime.seconds),"dd/MM/yyyy")}</Text>
        </View>
        <Text style={{fontSize:"20",marginTop:"90",marginBottom:"5",marginLeft:"10"}}>Descriere</Text>
        <View style={styles.description}>
            <View style={{padding:"10",margin:"10",}}>
                <Text style={{margin:"5"}}>Actiune efectuata: {props.data.type}</Text>
                <Text style={{margin:"5"}}>Pret: {props.data.price} lei</Text>
            </View>
            <View style={{padding:"10",margin:"10",}}>
                <Text style={{margin:"5"}}>Durata: {props.data.duration} minute</Text> 
                <Text style={{margin:"5"}}>Total: {props.data.price} lei</Text> 
            </View>
        </View>
            <Image src={logo} style={styles.image}/>
        </Page>
    </Document>
)

export class AnimalPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            clientId:null,
            clientEmail:null,
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
            //invoice data
            invoiceData:null,
            downloadAlert:false,
            sendSucces:false,
            // animal treatments
            treatments:[],
        }
        this.renderAnimalProfile = this.renderAnimalProfile.bind(this);
        this.getAnimalPhoto = this.getAnimalPhoto.bind(this);
        this.handleInvoice = this.handleInvoice.bind(this);
    }

    async componentDidMount(){
        let propsReceived = this.props.location.state;
        console.log(propsReceived);
        await this.getAnimalPhoto(propsReceived.animal.Photo).then(url => {
            console.log(url);
            this.setState({animal: propsReceived.animal,
            clientId: propsReceived.clientId,
            clientName: propsReceived.clientName,
            clientEmail: propsReceived.clientEmail,
            loading:false,
            imgUrl:url,
        });
        });
        this.populateAnimalAppointments();
        this.populateMeds();
        this.populateTreatments();
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
    
    async populateTreatments(){
        await animalService.getTreatments(this.state.clientId,this.state.animal.Name).then(treatments => {
            let treatmentsClones = []
            treatments.map(treatment => {
                let cloneTreatment = treatment;
                cloneTreatment.finalDate = new Date(fromUnixTime(treatment.finalDate.seconds));
                treatmentsClones.push(cloneTreatment);
            });
            this.setState({treatments:treatmentsClones})
        });
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
                            Varsta:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly defaultValue={this.state.animal.Age} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                            Rasa:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly defaultValue={this.state.animal.Breed} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                                Specie:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly as="select" disabled="true" value={this.state.animal.Species}>
                                <option value='0'>Caine</option>
                                <option value='1'>Pisica</option>
                            </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                                Sterilizat/Castrat:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly as="select" disabled="true"  name="Neutered" value={this.state.animal.Neutered} >
                                <option value='0'>Da</option>
                                <option value='1'>Nu</option>
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
    


    handleInvoice(e,data){
        if(this.state.downloadAlert === true){
            console.log("Alert is open already!");
            this.setState({downloadAlert:false,sendSucces:false});
        }
        let invoiceData = data;
        invoiceData["clientEmail"] = this.state.clientEmail;
        let full_name = this.state.clientName.split("_");
        invoiceData["clientName"] = full_name[0] + " " + full_name[1];
        this.setState({invoiceData:invoiceData,downloadAlert:true});
    }
    
    async sendInvoiceToFirebase(){
        const blob = await pdf(<Invoice data={this.state.invoiceData} />).toBlob();
        let fileName = this.state.invoiceData.animalName + "-" + format(fromUnixTime(this.state.invoiceData.startTime.seconds),"dd_MM_yyyy_hh_mm");
        console.log("Uploading invoice.");
        storage.ref(`${this.state.clientId}/${fileName}`).put(blob).then(() => {
            console.log("File " + fileName + "uploaded!");
            medicService.addClientInvoice(this.state.clientId,fileName);
            this.setState({sendSucces:true});
        }).catch(err => console.error("Error caught: ",err));
        notifications.sendNotification(this.state.invoiceData.clientId,"Ati primit o noua factura!");
    }

    renderAnimalHistoryMaterial(){
        const columns = [
            {title:'Data',field:'startTime',render: rowData => format(fromUnixTime(rowData.startTime.seconds),"dd/MM/yyyy"),editable:'never'},
            {title:'Tipul programarii',field:'type',editable:'never'},
            {title:'Pret(lei)',field:'price',type:'numeric'}
        ];
        return(
            <MaterialTable
            columns={columns}
            style={{marginTop:"2%"}}
            data={this.state.animalAppointments}
            title="Istoric programari"
            actions={[
                {
                icon: 'save',
                tooltip: 'Medicamente folosite',
                onClick: (event, rowData) => this.showMedsUsed(event,rowData)
                }
            ]}
            components={{
                Action: props => (
                <div className="row" style={{marginLeft:"1%"}}>
                <Button
                    onClick={(event) => props.action.onClick(event, props.data)}
                    variant="contained"
                    style={{textTransform: 'none'}}
                    size="small"
                    title="Mediccamente folosite"
                >
                    <FontAwesomeIcon icon={faSyringe} color="blue"/>
                </Button>
                <Button
                    onClick={(event) => this.handleInvoice(event, props.data)}
                    variant="contained"
                    style={{textTransform: 'none'}}
                    size="small"
                    title="Genereaza factura"
                >
                    <FontAwesomeIcon icon={faFileInvoice} color="green"/>
                </Button>
                </div>
                )
            }}
            />
        )
    }
    
    renderTreatmentsTable(){
        const columns = [{title:'Medicament',field:'treatment'},
                        {title:'Data expirarii',field:'finalDate',type:'date'},
                        {title:'Dozaj(pe zi)',field:'dosage',type:'numeric'},
                        {title:'Frecventa',field:'frequency',
                        lookup:{1:'zilnic',2:'o data la 2 zile',3:'o data la 3 zile',4:'o data la 4 zile',7:'saptamanal',31:'lunar'}},
                    ];
        
        return(
            <MaterialTable
            columns={columns}
            title="Tratamente animal"
            style={{marginTop:"2%"}}
            data={this.state.treatments}
            editable={{
                onRowAdd: (newItem) => 
                new Promise((resolve)=>
                setTimeout(async () =>
                {
                    resolve();
                    newItem["animalName"] = this.state.animal.Name;
                    console.log(newItem);
                    await animalService.addTreatment(newItem,this.state.clientId,this.state.animal.Id).then( async () => {
                        //send notification if add was succesfull
                        await notifications.sendNotification(this.state.clientId,"A fost adaugat un nou tratament pentru " + this.state.animal.Name);
                    }).catch("Nu a putut fii adaugat tratamentul.");
                    this.populateTreatments();
                },600)),
                onRowDelete:(oldItem) => 
                new Promise((resolve)=>
                setTimeout(()=>
                {
                    resolve();
                    animalService.deleteTreatment(oldItem,this.state.clientId,this.state.animal.Id);
                    this.populateTreatments();
                })),
                onRowUpdate: (newItem,oldItem) =>
                new Promise((resolve)=>
                setTimeout( async ()=>
                {
                    resolve();
                    if(typeof(newItem.finalDate) === "string")
                        newItem.finalDate = new Date(newItem.finalDate);

                    await animalService.updateTreatment(newItem,this.state.clientId,this.state.animal.Id);
                    this.populateTreatments();
                },600)) 
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
                    {(this.state.downloadAlert === true) ? 
                        <Alert variant="info" onClose={() => this.setState({downloadAlert:false,sendSucces:false})} dismissible>
                        <Alert.Heading>Factura</Alert.Heading>
                        <div className="row">
                            <PDFDownloadLink className="col-sm" document={<Invoice data={this.state.invoiceData} />} 
                                fileName={this.state.invoiceData.animalName + "-" + format(fromUnixTime(this.state.invoiceData.startTime.seconds),"dd_MM_yyyy")}>
                            {({ blob, url, loading, error }) => (loading ? 'Incarcare document...' : 'Descarca acum!')}
                            </PDFDownloadLink>
                            {(this.state.sendSucces === false) ?
                            <Button className="col-sm" variant="secondary" onClick={() => this.sendInvoiceToFirebase()}>
                                Trimite factura la client
                            </Button> : <FontAwesomeIcon className="col-sm" icon={faCheckCircle} size="3x"/>
                            }  
                        </div>         
                        </Alert>
                         : ""}
                        <Tabs defaultActiveKey="history" id="animalPageTabs">
                            <Tab eventKey="history" title="Istoric">
                                {(this.state.animalAppointments.length > 0) ? this.renderAnimalHistoryMaterial() : <h3>Acest animal nu a avut programari inca.</h3>}
                            </Tab>
                            <Tab eventKey="treatments" title="Tratamente">
                                {this.renderTreatmentsTable()}
                            </Tab>
                        </Tabs>
                            
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
        
        const columns = [{title:'Medicamente folosite',field:'med', lookup:medsLookUp},
            {title:'Cantitate(g)',field:'quantity',type:'numeric',
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
            title="Medicamente folosite"
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
                    <Modal.Title>Adaugati medicamentele folosite</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        {(this.state.showAlert) ? this.renderAlert("Nu exista o cantitate suficienta pe stoc!") : ""}
                        {this.renderMedsTable()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.onHide}>
                        Inchide
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}