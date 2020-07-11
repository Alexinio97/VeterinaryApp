import React, { Component } from 'react';
import {format, fromUnixTime} from 'date-fns';
import '../stylingComponents/Appointments.css';
import { medicService } from '../../services/medic.service';
import { Spinner } from 'react-bootstrap';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppointmentAdd from './ModalAddAppointment';
import { Button } from 'react-bootstrap';
import { ScheduleComponent, Inject, Day, WorkWeek, Month, ViewDirective, ViewsDirective} from '@syncfusion/ej2-react-schedule';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { auth } from 'firebase';
import { notifications } from '../../helpers/notification';


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
            minDate:null,
            maxDate:null,
        }
        this.handleClick = this.handleClick.bind(this);
        this.makeAppointment = this.makeAppointment.bind(this);
        this.handleAppointmentSave = this.handleAppointmentSave.bind(this);
        this.showDeleteDialog = this.showDeleteDialog.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }
    componentDidMount(){
        if(auth().currentUser !== null)
            this.setMedicSchedule();
            this.populateAppointments();
    }

    async populateAppointments(){
        // get upcoming appointments for all month
        let minDate =  new Date();
        minDate.setHours(0,0,0,0);
        let maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 20);
        maxDate.setHours(23,0,0,0);
        await medicService.GetAppointmentsFuture().then(appoints => this.setState({
            appointments:appoints,
            loading:false,
            minDate:minDate,
            maxDate:maxDate,
        }));
    }


    handleClick(event){

        this.setState({[event.name]: event.checked});
    }

    makeAppointment(e){
        console.log(e);
        var selectedDay = new Date(e.startTime);
        console.log(selectedDay, this.state.maxDate);
        if(selectedDay >= this.state.maxDate || selectedDay < this.state.minDate)
        {
            alert("Ziua maxima a fost depasita!");
            return;
        }
        if(selectedDay.getHours() === 0)
            return;
        let endTime = new Date(e.endTime);
        console.log("End time: !!!!!!!!" ,endTime);
        var isSlotOccupied = false;
        this.state.appointments.map( appoint => {
            let dateAppointStart = new Date(fromUnixTime(appoint.startTime.seconds));
            let dateAppointEnd = new Date(fromUnixTime(appoint.endTime.seconds));
            if(dateAppointStart.getTime() === selectedDay.getTime() || dateAppointEnd.getTime() === endTime.getTime())
            {
                alert("Exista deja o programare!");
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
        {
            let appointDeleted = null;
            this.state.appointments.map( appoint => {
                if(appoint.Id === props.Id){
                    appointDeleted = appoint;
                }
            })
            console.log(appointDeleted);
            this.setState({deleteModal:true,appointToDelete:appointDeleted});
        }
    }

    async handleDelete(){
        await medicService.deleteAppointment(this.state.appointToDelete.Id);
        notifications.sendNotification(this.state.appointToDelete.clientId,"Programare pentru " +this.state.appointToDelete.animalName + " la " + format(new Date(fromUnixTime(this.state.appointToDelete.startTime.seconds)),"dd/MM/yyyy k:mm a") + " a fost anulata, reprogramati.")
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
                <DialogTitle id="alert-dialog-title">Stergere programare</DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Sunteti sigur ca vreti sa stergeti aceasta programare?
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => this.setState({deleteModal:false})} color="primary">
                    Nu
                </Button>
                <Button onClick={this.handleDelete} color="primary" autoFocus>
                    Da
                </Button>
                </DialogActions>
            </Dialog>
        )
    }

    async handleAppointmentSave(appointment){
        // TODO: send notification to client
        this.setState({showAddModal:false});
        await medicService.addAppointment(appointment);
        alert("Programare efectuata!")
        notifications.sendNotification(appointment.clientId, "Aveti programare noua in " + format(appointment.startTime,"dd/MM/yyyy k:mm a"));
        await this.populateAppointments(this.state.selectedDay);
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
                    minDate={this.state.minDate}
                    maxDate={this.state.maxDate}
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
                <div className="page-header"><h1>Programari</h1></div>
                <div className="container">
                {this.state.loading ? <Spinner animation="border" variant="primary">
                                    <span className="sr-only">Asteapta...</span>
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



    


    