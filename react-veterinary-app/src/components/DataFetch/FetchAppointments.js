import React, { Component } from 'react';
import {Calendar} from '../Calendar';
import {format, differenceInHours , addHours, getHours, fromUnixTime} from 'date-fns';
import '../stylingComponents/Appointments.css';
import { medicService } from '../../services/medic.service';
import { Spinner } from 'react-bootstrap';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppointmentAdd from './ModalAddAppointment';
import { PopoverHeader, PopoverBody, UncontrolledPopover} from 'reactstrap';
import { Button } from 'react-bootstrap';

export class Appointments extends Component{
    constructor(props){
        super(props);
        this.state ={
            clickedDay:new Date(),
            Appointments:'',
        }
        this.handleClickDate = this.handleClickDate.bind(this);
    }


    handleDateClick = (arg) => { // bind with an arrow function
        alert(arg.dateStr)
    }
    disableWeekends(maxDate)
    {
        var today = new Date();
        var weekends = [];
        for (var d = today; d <= maxDate; d.setDate(d.getDate() + 1)) {
            if( d.getDay() === 0 || d.getDay() === 6)
            {
                weekends.push(new Date(d));
            }
        }
        return weekends;
    }

    

    handleClickDate(day){
        this.setState({clickedDay: day});
    }
    render(){
        let formattedClickedDay = format(this.state.clickedDay,"EEE - d LLL");
        return(
            <div>
                <div style={{float: "left",width:"60%",marginRight:"auto",marginLeft:"auto"}}>
                    <Calendar
                     handleClickDate={this.handleClickDate}
                     value={this.state}
                    />
                </div>
                <div className="text-center" style={{ float: "right",width: "40%"}}>
                    <h3>{formattedClickedDay}</h3>
                    <TodayAppointments
                        selectedDay={this.state.clickedDay}
                    />
                </div>
            </div>
        );
    }
}


export class TodayAppointments extends Component{
    constructor(props){
        super(props)
        this.state = {
            startHour: new Date(0,0,0,8,0,0),
            finishHour: new Date(0,0,0,16,30,0),
            appointments: [],
            hourClicked: null,
            showAddModal:false,
            loading: true,
            clients:[],
        }
        this.renderHours = this.renderHours.bind(this);
        this.handleAppointmentSave = this.handleAppointmentSave.bind(this);
    }


    async populateAppointments(dayClicked)
    {
        await medicService.getAppointments(dayClicked).then(appointments => this.setState({appointments:appointments,loading:false}));
    }
    componentDidMount()
    {
        this.populateAppointments(this.props.selectedDay);
    }
    
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.selectedDay!==this.props.selectedDay){
            this.populateAppointments(this.props.selectedDay);
        }
    }

    renderHours(){
        console.log("Rerender hours");
        let appointments = this.state.appointments;
        let rows = []
        let fullProgram = differenceInHours(this.state.finishHour,this.state.startHour,{includeSeconds:true});
        let currentHour = this.state.startHour;

        for(let hour = 0; hour <= fullProgram; hour++){
            let formattedHour = format(currentHour,"H - aaaa");
            let tableData = "";
            appointments.map(appointment => {
                if(getHours(fromUnixTime(appointment.startTime.seconds)) === getHours(currentHour))
                {   
                    let convertedDate = new Date(fromUnixTime(appointment.startTime.seconds));
                    // note: tag id's can't start with numbers!
                    tableData = <div><Button type="button" variant="outline-success" id={"s"+appointment.Id}>{appointment.type}</Button>
                    <UncontrolledPopover placement="right" trigger="focus" target={"s"+appointment.Id}>
                        <PopoverHeader>{appointment.animalName} appointment</PopoverHeader>
                        <PopoverBody>
                            Appointment starts at: {format(convertedDate,"H.mm - aaaa")}<br/>
                            Duration is: {appointment.duration} minutes<br/>
                            Observations: {appointment.observations}
                        </PopoverBody>
                    </UncontrolledPopover>
                    </div>; 

                }
            });
            console.log(tableData);
            rows.push(
                <tr>
                    <td>{formattedHour}</td>
                    {(appointments.length > 0) ?
                    <td>
                        {(tableData !== "") ? tableData : 
                        <button className="btn" onClick={() => this.showAppointmentModal(formattedHour)}><FontAwesomeIcon icon={faPlusSquare} size="lg" color="blue" title="Make appointment"/></button> }
                    </td> :
                    <td>
                    <button className="btn" onClick={() => this.showAppointmentModal(formattedHour)}><FontAwesomeIcon icon={faPlusSquare} size="lg" color="blue" title="Make appointment"/></button>
                    </td>
                }
                </tr>
            );
            currentHour = addHours(currentHour,1);
        }
        return <tbody>{rows}</tbody>
    }

    async handleAppointmentSave(appointment){
        this.setState({showAddModal:false});
        await medicService.addAppointment(appointment);
        alert("Appointment made!")
        await this.populateAppointments(this.props.selectedDay);
    }

    showAppointmentModal(hourClicked){

        console.log("Button clicked" + hourClicked);
        this.setState({
            hourClicked:hourClicked,
            showAddModal:true,
        })
    }

    render() {
        let modalClose = () => this.setState({showAddModal:false})

        return(
            <div className="appointment">
                <table>
                    <thead>
                        <tr>
                            <th>Hour</th>
                            <th>Appointment</th>
                        </tr>
                    </thead>
                    {(this.state.loading) ? <Spinner id="spinnerApp" animation="border" variant="primary">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                    : this.renderHours()}
                </table>
                <AppointmentAdd
                    currentHour={this.state.hourClicked}
                    selectedDay={this.props.selectedDay}
                    show={this.state.showAddModal}
                    handleAppointmentSave={this.handleAppointmentSave}
                    onHide={modalClose}
                />
            </div>
        );
    }
}