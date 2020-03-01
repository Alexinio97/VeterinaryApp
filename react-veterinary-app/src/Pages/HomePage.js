import React, {Component} from 'react';
import { Spinner } from 'reactstrap';
import { medicService } from '../services/medic.service';
import {auth} from 'firebase';

export class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            medic: null,
            loading: false
        };
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    async componentDidMount()
    {
        if(auth().currentUser !==null)
        {
            var medicLoggedId = auth().currentUser.uid;
            console.log(this.state.medic);
            if(medicLoggedId !== null && this.state.medic === null)
            {
                let medicLogged = await medicService.getMedicData(medicLoggedId);
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
        
    }

    renderMedicData()
    {

        const medic = this.state.medic;
        
        return(
            <h1 className="text-center">Welcome, {(medic !== null) ? medic.FirstName: ""}!</h1>
        );
    }

    render() {
        let contents = this.state.loading
        ? <Spinner animation="border" variant="primary">
            <span className="sr-only">Loading...</span>
            </Spinner>
        : this.renderMedicData()
        return(
            contents
        );
    }
}

