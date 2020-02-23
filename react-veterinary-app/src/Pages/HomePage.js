import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import { medicService } from '../services/medic.service';

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
        console.log(this.props);
        var medicLogged = null;
        if(this.props.medic !== undefined)
        {
            medicLogged = await medicService.getMedicData(this.props.medic.uid);
            console.log(medicLogged);
            this.setState({ 
                medic: medicLogged,
                loading: false
            });
        }
        else
        {
            console.log("got undefined");
            medicLogged = "medic";
        }
        
    }

    renderMedicData()
    {

        const medic = this.state.medic;
        
        return(
            <h1 className="text-center">Welcome, medic!</h1>
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

