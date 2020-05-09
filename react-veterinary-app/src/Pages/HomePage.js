import React, {Component} from 'react';
import { Spinner } from 'reactstrap';
import { medicService } from '../services/medic.service';
import {auth} from 'firebase';
import { format, fromUnixTime } from 'date-fns';
import { Card } from 'react-bootstrap';
import '../components/stylingComponents/Appointments.css';

export class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            medic: null,
            loading: false,
            upcomingAppointments: [],
        };
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    // data fetching methods
    async componentDidMount()
    {
        if(auth().currentUser !==null)
        {
            var medicLoggedId = auth().currentUser.uid;
            console.log(this.state.medic);
            if(medicLoggedId !== null && this.state.medic === null)
            {
                let medicLogged = await medicService.getMedicData();
                console.log(medicLogged);
                this.setState({ 
                    medic: medicLogged,
                    loading: false
                });
            }
        }
        else{
            console.log("User not logged in.");
        }
        this.populateTodayAppointments();
    }

    async populateTodayAppointments(){
        let today = new Date();
        await medicService.getAppointments(today).then(appointments => this.setState({upcomingAppointments:appointments}))
    }


    // render methods
    renderMedicData()
    {

        const medic = this.state.medic;
        
        return(
            <h1 className="text-center">Welcome, {(medic !== null) ? medic.FirstName: ""}!</h1>
        );
    }

    renderUpcomingAppointments(){
        let cards = [];
        if(this.state.upcomingAppointments.length>0){
        this.state.upcomingAppointments.map(appointment => {
            let convertedDate = format(fromUnixTime(appointment.startTime.seconds),"H:mm a");
            cards.push(
                <Card bg='info' key={appointment.Id} style={{width:'18rem',height:'8rem',marginBottom:'10px'}}>
                    <Card.Header>At {convertedDate} </Card.Header>
                    <Card.Body>
                        <Card.Title as='h6'>{appointment.animalName} appointment</Card.Title>
                        <Card.Text>
                        Appointment type: {appointment.type}.
                        </Card.Text>
                    </Card.Body>
                </Card>);
            })
        }
        else{
            cards.push(<h4>No appointments today yet.</h4>);
        }
        return cards;
    }

    render() {
        let contents = this.state.loading
        ? <Spinner animation="border" variant="primary">
            <span className="sr-only">Loading...</span>
            </Spinner>
        : this.renderMedicData();

        let appointments = this.renderUpcomingAppointments();
        return(
            <div>
                <div className="upcoming-appointments">
                <Card bg="light" border="dark">
                    <Card.Header>Appointments today</Card.Header>
                        <Card.Body className="scroll">
                            {appointments}
                        </Card.Body>
                </Card>
                </div>
            </div>
        );
    }
}

