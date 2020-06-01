import React, {Component} from 'react';
import { medicService } from '../services/medic.service';
import {auth} from 'firebase';
import { format, fromUnixTime } from 'date-fns';
import { Card } from 'react-bootstrap';
import '../components/stylingComponents/Appointments.css';
import { faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            medic: null,
            loading: false,
            upcomingAppointments: [],
            notifications:[],
        };
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

    render() {
        
        let appointments = this.renderUpcomingAppointments();
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
                
            </div>
        );
    }
}

