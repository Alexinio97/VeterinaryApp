import React, { Component } from 'react';
import {format, differenceInHours , addHours, getHours, fromUnixTime} from 'date-fns';
import '../stylingComponents/Appointments.css';
import { medicService } from '../../services/medic.service';
import { Spinner } from 'react-bootstrap';
import { faTrash ,faTimes} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppointmentAdd from './ModalAddAppointment';
import { PopoverHeader, PopoverBody, UncontrolledPopover} from 'reactstrap';
import { Button } from 'react-bootstrap';
import { ScheduleComponent, Inject, Day, WorkWeek, Month, ViewDirective, ViewsDirective} from '@syncfusion/ej2-react-schedule';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';


export class Appointments extends Component{
    constructor(props){
        super(props);
        this.state ={
            clickedDay:new Date(),
            appointments:[],
            disabledWeekEnds:false,
            showAddModal:false,
            hourClicked:null,
            selectedDay:null,
            loading:true,
            deleteModal:false,
            appointToDelete: null,
            startHour:null,
            finishHour:null,
        }
        this.handleClick = this.handleClick.bind(this);
        this.makeAppointment = this.makeAppointment.bind(this);
        this.handleAppointmentSave = this.handleAppointmentSave.bind(this);
        this.showDeleteDialog = this.showDeleteDialog.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }
    componentDidMount(){
        this.setMedicSchedule();
        this.populateAppointments();
    }

    async populateAppointments(){
        // get upcoming appointments for all month
        await medicService.GetAppointmentsFuture().then(appoints => this.setState({appointments:appoints,loading:false}));
    }


    handleClick(event){

        this.setState({[event.name]: event.checked});
    }

    makeAppointment(e){
        console.log(e);
        var selectedDay = new Date(e.startTime);
        if(selectedDay.getHours() == 0)
            return;
        let endTime = new Date(e.endTime);
        console.log("End time: !!!!!!!!" ,endTime);
        var isSlotOccupied = false;
        this.state.appointments.map( appoint => {
            let dateAppointStart = new Date(fromUnixTime(appoint.startTime.seconds));
            let dateAppointEnd = new Date(fromUnixTime(appoint.endTime.seconds));
            if(dateAppointStart.getTime() === selectedDay.getTime() || dateAppointEnd.getTime() === endTime.getTime())
            {
                alert("There is an appointment there already!");
                isSlotOccupied = true;
            }
        });
        if(isSlotOccupied === true)
            return;
        this.setState({showAddModal:true,selectedDay:selectedDay,hourClicked:selectedDay.getHours()});
    }

    onPopUpOpen(args){
        if(args.data.Subject === undefined){
            args.cancel = true;
        }
        else
        {
            args.cancel = false;
        }
    }
    header(props) {
        console.log(props);
        return (<div>
      {props.elementType === 'cell' ?
            <div className="e-cell-header">
            <div className="e-header-icon-wrapper">
              <Button className="btn-primary">Ceva</Button>
            </div>
          </div> :
            <div className="e-event-header">
            <div className="row"> 
                <div className="col">
                    <h4>{props.Subject}</h4>
                </div>
                <div className=".col-md-3 .offset-md-3">
                    <button className="btn" title="Delete" onClick={() => this.showDeleteDialog(props)}>
                        <FontAwesomeIcon icon={faTrash} color="white" />
                    </button>
                </div>
                <div className="col-md-auto">
                    <div className="e-header-icon-wrapper">
                        <button className="e-close" title="close"></button>
                    </div>
                </div>
            </div>
            
          </div>}
    </div>);
    }
    
    showDeleteDialog(props){
        if(this.state.deleteModal === false)  
            this.setState({deleteModal:true,appointToDelete:props.Id});
    }

    async handleDelete(){
        await medicService.deleteAppointment(this.state.appointToDelete);
        this.populateAppointments();
        this.setState({deleteModal:false});
    }

    renderDeleteDialog(){
        return(
            <Dialog
                open={this.state.deleteModal}
                onClose={() => this.setState({deleteModal:false})}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Delete Appointment</DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this appointment?
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => this.setState({deleteModal:false})} color="primary">
                    No
                </Button>
                <Button onClick={this.handleDelete} color="primary" autoFocus>
                    Yes
                </Button>
                </DialogActions>
            </Dialog>
        )
    }

    async handleAppointmentSave(appointment){
        // TODO: send notification to client
        this.setState({showAddModal:false});
        await medicService.addAppointment(appointment);
        alert("Appointment made!")
        this.sendAppointmentNotification(appointment);
        await this.populateAppointments(this.state.selectedDay);
    }

    async sendAppointmentNotification(appointment){
        let token = "<user_token/s>";
        const FIREBASE_API_KEY = "<server_key>";
        const message = {
         registration_ids: [token], 
          notification: {
            title: "Daily Vet",
            body: "New appointment at " + format(appointment.startTime,"dd/MM/yyyy k:mm a"),
            "vibrate": 1,
            "sound": 1,
            "show_in_foreground": true,
            "priority": "high",
            "content_available": true,
          },
          data: {
            title: "Daily Vet",
            body: "IND chose to bat",
          }
        };
      
        let headers = new Headers({
          "Content-Type": "application/json",
          "Authorization": "key=" + FIREBASE_API_KEY
        });
      
        let response = await fetch("https://fcm.googleapis.com/fcm/send", { method: "POST", headers, body: JSON.stringify(message) })
        response = await response.json();
    }

    async setMedicSchedule(){
        await medicService.getMedicData().then(medic => {
            console.log(medic.Schedule);
            this.setState({
            startHour:medic.Schedule.start,
            finishHour:medic.Schedule.end
            })
        })
    }

    renderScheduler(){
        let scheduleAppointments = [];

        this.state.appointments.map( appoint => {
            let scheduleApp = {
                Id: appoint.Id,
                Subject: appoint.type +", " + appoint.animalName,
                StartTime: new Date(fromUnixTime(appoint.startTime.seconds)),
                EndTime: new Date(fromUnixTime(appoint.endTime.seconds)),
                Description: appoint.observations,
            }
            scheduleAppointments.push(scheduleApp);
        });

        return(
            <ScheduleComponent startHour={this.state.startHour} endHour={this.state.finishHour} cellClick={this.makeAppointment}
                    popupOpen={this.onPopUpOpen}
                    quickInfoTemplates={{header: this.header.bind(this)}}
                    eventSettings={{dataSource:scheduleAppointments}}>
                        <ViewsDirective>
                            <ViewDirective option='Day'/>
                            <ViewDirective option='WorkWeek'/>
                            <ViewDirective option='Month'/>
                        </ViewsDirective>
                        <Inject services={[Day,WorkWeek,Month]}/>
                    </ScheduleComponent>
        )
    }

    render(){
        let modalClose = () => this.setState({showAddModal:false})
        return(
            <div>
                <div className="page-header"><h1>Appointments</h1></div>
                <div className="container">
                {this.state.loading ? <Spinner animation="border" variant="primary">
                                    <span className="sr-only">Loading...</span>
                            </Spinner> : this.renderScheduler() }
                </div>
                {this.renderDeleteDialog()}
                <AppointmentAdd
                    currentHour={this.state.hourClicked}
                    selectedDay={this.state.selectedDay}
                    show={this.state.showAddModal}
                    handleAppointmentSave={this.handleAppointmentSave}
                    onHide={modalClose}
                />
            </div>
        );
    }
}



    


    