import React, { Component } from 'react';
import {Calendar}  from '../Calendar';

export class Appointments extends Component{
    constructor(props){
        super(props);
        this.state ={

        }
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
    render(){
        
        return(
            <div>
                <Calendar style={{float: "left"}}>
                </Calendar>
                <div className="text-align center" style={{ float: "right"}}>
                    <h3>Appointments clicked</h3>
                </div>
            </div>
        );
    }
}