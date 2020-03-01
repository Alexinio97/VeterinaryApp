import React, { Component } from 'react';

export class AnimalPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            clientId:null,
            animal:null,
        }
    }

    componentDidMount(){
        let propsReceived = this.props.location.state;
        this.setState({
            animal: propsReceived.animal,
            clientId: propsReceived.clientId,
        })
    } 

    render() {
        return (
            <div>
                <h2>Welcome to animal profile page.</h2>
            </div>
        )
    }
}