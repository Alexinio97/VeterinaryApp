import React, { Component } from 'react';
import {Calendar} from '../Calendar';
import {format, differenceInHours ,formatDistance, addHours, getHours, fromUnixTime, subDays} from 'date-fns';
import '../stylingFiles/Appointments.css';
import { medicService } from '../../services/medic.service';
import { Spinner } from 'react-bootstrap';

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
            loading: true,
        }
        this.renderHours = this.renderHours.bind(this);
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
        let appointments = this.state.appointments;
        let rows = []
        let fullProgram = differenceInHours(this.state.finishHour,this.state.startHour,{includeSeconds:true});
        let currentHour = this.state.startHour;

        for(let hour = 0; hour <= fullProgram; hour++){
            let formattedHour = format(currentHour,"H - aaaa");
            rows.push(
                <tr>
                    <td>{formattedHour}</td>
                    <td>
                    {appointments.map(appointment =>
                    (getHours(fromUnixTime(appointment.startTime.seconds)) === getHours(currentHour)) ? appointment.type : ""
                    )}
                    </td>
                </tr>
            );
            currentHour = addHours(currentHour,1);
        }
        return <tbody>{rows}</tbody>
    }

    render() {
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
            </div>
        );
    }
}