import React, {Component} from 'react';
import {format,addMonths,subMonths, startOfWeek, addDays, startOfMonth, 
    endOfMonth, endOfWeek, isSameMonth, isSameDay, parse, parseISO} from 'date-fns';
import './stylingFiles/Calendar.css';
import{faChevronLeft,faChevronRight}  from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export class Calendar extends Component{
    constructor(props){
        super(props);
        this.state = {
            currentMonth: new Date(),
            selectedDate: new Date()
        };
    }

    nextMonth = () => {
        this.setState({
            currentMonth: addMonths(this.state.currentMonth,1), 
        })
    }

    prevMonth = () => {
        this.setState({
            currentMonth: subMonths(this.state.currentMonth,1),
        })
    }

    renderHeader(){
        const dateFormat = "MMMM yyyy";

        return(
            <div className="header row flex-middle">
                <div className="col col-start">
                    <div className="icon" onClick={this.prevMonth}>
                    <FontAwesomeIcon icon={faChevronLeft}/>
                    </div>
                </div>
                <div className="col col-center">
                    <span>
                        {format(this.state.currentMonth,dateFormat)}
                    </span>
                </div>
                <div className="col col-end" onClick={this.nextMonth}>
                    <div className="icon"><FontAwesomeIcon icon={faChevronRight}/></div>
                </div>
            </div>
        );
    }

    renderDays() {
        const dateFormat = "EEEE";
        const days = [];
        
        let startDate = startOfWeek(this.state.currentMonth);

        for(let i = 0; i < 7; i++)
        {
            days.push(
                <div className="col col-center" key={i}>
                    {format(addDays(startDate,i),dateFormat)}
                </div>
            );
        }
        return <div className="days row">{days}</div>;
    }

    renderCells() {
        const { currentMonth, selectedDate } = this.state;
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];

        let days = [];
        let day = startDate;
        let formattedDate = "";

        while(day <= endDate) {
            for(let i = 0; i<7;i++){
                formattedDate = format(day,dateFormat);
                const cloneDay = day.toLocaleDateString();
                days.push(
                    <div 
                        className={`col cell ${
                            !isSameMonth(day,monthStart)
                            ? "disabled" 
                            :  isSameDay(day, selectedDate) ? "selected" : ""
                        }`}
                        key={day}
                        onClick={ () => this.onDateClick(parse(cloneDay,'mm/dd/yyyy',new Date()))}
                        >
                        <span className="number">{formattedDate}</span>
                        <span className="bg">{formattedDate}</span>
                    </div>
                );
                day = addDays(day,1);
            }
            rows.push(
                <div className="row" key={day}>
                    {days}
                </div>
            );
            days =[];
        }
        return <div className="body">{rows}</div>
    }

    onDateClick = day => {
        this.setState({
            selectedDate: day
        })
    }

    render() {
        return(
            <div className="calendar">
                {this.renderHeader()}
                {this.renderDays()}
                {this.renderCells()}
            </div>
        );
    }
}