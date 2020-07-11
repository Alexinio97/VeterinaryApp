import React,{Component} from 'react';
import { medicService } from '../../services/medic.service';
import { format, addMinutes } from 'date-fns';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import  { animalService } from '../../services/animal.service';
import { ro } from 'date-fns/locale'

export default class AppointmentAdd extends Component{

    constructor(props){
        super(props);
        this.state={
            clients: [],
            clientAnimals: [],
            selectedDay:null,
            startHour: null,
            appointmentToMake:null,
            clientSelected:null,
            animalSelected:null,
            duration:null,
            type:null,
            displayDate:null,
            observations:null,
            appTypes:[],
            price:null,
            errors:{},
        }
        this.populateClientAnimals = this.populateClientAnimals.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeForm = this.handleChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }
    
    componentDidMount(){    
        this.populateClients();
        this.populateAppTypes();
    }

    componentDidUpdate(prevProps){
        if(prevProps !== this.props){
            if(this.state.clients.length > 0)
            {
                let constructedAppointment = null;
                console.log(this.props.selectedDay);
                constructedAppointment = new Date(this.props.selectedDay);
                console.log(constructedAppointment);
                if(this.props.startHour !== undefined){
                    constructedAppointment.setHours(Number(this.props.startHour.replace( /^\D+/g, ''))); // replace all leading non-digits with nothing
                }
                if(this.state.clients[0].Id !== null)
                    this.populateClientAnimals(this.state.clients[0].Id);
                console.log("Did update!");
                let animalSelected = this.state.clientAnimals[0]
                this.setState({
                    startHour: this.props.currentHour,
                    selectedDay: this.props.selectedDay,
                    appointmentToMake: constructedAppointment,
                    animalSelected:animalSelected,
                    clientSelected:this.state.clients[0].Id,
                    duration:this.state.appTypes[0].duration,
                    price:this.state.appTypes[0].price,
                    type:this.state.appTypes[0].type,
                });
            }
        }
    }

    // firebase fetching
    async populateClients(){
        await medicService.getAllClients().then(clients => this.setState({clients:clients}));
    }
    
    async populateClientAnimals(clientId){
       await animalService.getUsersAnimals(clientId).then(animals => this.setState({clientAnimals:animals,animalSelected:animals[0]}));
    }

    async populateAppTypes(){
        await medicService.getAppointmentTypes().then(appTypes => this.setState({appTypes:appTypes}))
    }
    
    // handlers
    handleChange(e) {
        const {name,value} = e.target;
        // populate select with client animals
        if(name === "clientSelected")
        {
            this.populateClientAnimals(value);
            this.setState({[name]:value});
        }
        else if(name === "type"){
            // populate duration default value
            console.log(value);
            this.state.appTypes.map(appType => {
                if(value === appType.type)
                {
                    this.setState({[name]:value,duration:appType.duration,price:appType.price});
                }
            })
        }
        else{
            this.setState({[name]:value});
        } 
    }

    validateAppointment(appointment){
        let errors = {};
        let isValid = true;
        if(appointment.duration < 15 )
        {
            errors["duration"] = "Adaugati o durata valida!(peste 15 minute)";
            isValid = false;
        }
        if(appointment.price < 0){
            errors["price"] = "Adaugati valori pozitive sau lasati necompletat!";
            isValid = false;
        }

        this.setState({errors:errors});
        return isValid;
    }
    
    async handleSave(){
        let appointmentDate = this.state.appointmentToMake;
        let animalName = null;
        
        console.log(this.state.duration);
        let endTime = addMinutes(appointmentDate,Number(this.state.duration));
        if(this.state.animalSelected.Name === undefined)
        {
            animalName = this.state.animalSelected;
            
        }
        else
        {
            animalName = this.state.animalSelected.Name;
        }
       
        const appointment = {
            animalName:animalName,
            clientId:this.state.clientSelected,
            duration:Number(this.state.duration),
            startTime:appointmentDate,
            endTime:endTime,
            price:this.state.price,
            type:this.state.type,
            observations:(this.state.observations === null || this.state.observations === "" ) ? "None" : this.state.observations,
        }
        let validationResult = this.validateAppointment(appointment);
        if(validationResult === false)
        {
            return;
        }
        this.props.handleAppointmentSave(appointment);
    }

    

    // render
    renderFormModal(){
        return(<div>
            <Form onSubmit={this.handleSubmit}>
            <Form.Group controlId="formGoupClient">
            <Form.Label>Client</Form.Label>
                <Form.Control as="select"  name="clientSelected" onChange={this.handleChange} value={this.state.clientSelected}>
                    {this.state.clients.map(client =>
                        <option value={client.Id} key={client.Email}>{client.FirstName},{client.LastName}</option>
                    )}
                </Form.Control>
            </Form.Group>
            <Form.Group controlId="formGroupAnimal">
            <Form.Label>Animalul clientului</Form.Label>
                {(this.state.clientAnimals.length !== 0) ?
                <Form.Control as="select"  name="animalSelected" value={this.state.animalSelected} onChange={this.handleChange}>
                    {this.state.clientAnimals.map(animal =>
                        <option value={animal.Name}>{animal.Name}</option>
                    )}
                </Form.Control>:""
                }
            </Form.Group>
            <Form.Group>
                <Form.Label>Tipul programarii</Form.Label>
                <Form.Control as="select" name="type" value={this.state.type} onChange={this.handleChange}>
                    {this.state.appTypes.map(appType =>
                        <option value={appType.type}>{appType.type}</option>
                    )}
                </Form.Control>
            </Form.Group>
            <Form.Group>
                <Form.Label>Duratia:</Form.Label>
                <Form.Control type="number" name="duration" value={this.state.duration}  onChange={this.handleChange}>
                </Form.Control>
                <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["duration"]}</b></span>
            </Form.Group>
            <Form.Group>
                <Form.Label>Pretul(lei):</Form.Label>
                <Form.Control type="number" name="price" value={this.state.price}  onChange={this.handleChange}>
                </Form.Control>
                <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["price"]}</b></span>
            </Form.Group>
            <Form.Group>
                <Form.Label>Observatii</Form.Label>
                <Form.Control as="textarea" rows="3" name="observations" value={this.state.observations} onChange={this.handleChange}></Form.Control>
            </Form.Group>
            </Form>
        </div>
        );
    }

    render(){
        let displayDate = "";
        let appointmentContent = (this.state.clients.length !==0) ? this.renderFormModal() : ""
        if(this.state.startHour !== null)
        {
            displayDate = format(this.state.selectedDay,"dd MMM k:mm a",{locale:ro});
        }
        return(
        <Modal {...this.props} dialogClassName="appointmentModal">
        <Modal.Header closeButton>
          <Modal.Title>Faceti programare pentru {(this.state.startHour!==undefined) ?  displayDate : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {appointmentContent}
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={this.props.onHide} >
            Inchide
          </Button>
          <Button variant="primary" onClick={this.handleSave}>
            Salveaza programarea
          </Button>
        </Modal.Footer>
      </Modal>
        );
    }
}