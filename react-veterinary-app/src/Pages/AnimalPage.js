import React, { Component } from 'react';
import './pageStyling/animalPage.css';
import { storage } from '../firebaseConfig/config';
import { Form, Spinner, CardGroup, Card } from 'react-bootstrap';
import { Col,Row} from 'react-bootstrap';



export class AnimalPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            clientId:null,
            animal:null,
            loading:true,
            imgUrl:null,
            clientName:null
        }
        this.renderAnimalProfile = this.renderAnimalProfile.bind(this);
        this.getAnimalPhoto = this.getAnimalPhoto.bind(this);
    }

    async componentDidMount(){
        let propsReceived = this.props.location.state;
        console.log(propsReceived);
        await this.getAnimalPhoto(propsReceived.animal.Photo).then(url => {
            console.log(url);
            this.setState({animal: propsReceived.animal,
            clientId: propsReceived.clientId,
            clientName: propsReceived.clientName,
            loading:false,
            imgUrl:url,
        });
        });
       
    } 

    async getAnimalPhoto(photoName){
        if(photoName !== null)
        {
            console.log(photoName);
            return storage.ref().child(`animalProfilePics/${photoName}`).getDownloadURL().then( url =>
                {
                    return url;
                })
            .catch(error => console.log("Error caught: " + error.message));
        }
        else
        {
            console.log("Else branch");
            return "No photo!";
        }
    }

    renderAnimalProfile(){
        
        return (
            <div class="profileData">
                    <CardGroup>
                    <Card>
                        <Card.Img variant="top" src={this.state.imgUrl} />
                        <Card.Body>
                        <Card.Title>{this.state.animal.Name}</Card.Title>
                    <Form className="jumbotron">
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                            Age:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly defaultValue={this.state.animal.Age} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                            Breed:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly defaultValue={this.state.animal.Breed} />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                                Species:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly as="select" value={this.state.animal.Species}>
                                <option value='0'>Dog</option>
                                <option value='1'>Cat</option>
                            </Form.Control>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="5">
                                Neutered:
                            </Form.Label>
                            <Col sm="5">
                            <Form.Control plaintext readOnly as="select"  name="Neutered" value={this.state.animal.Neutered} >
                                <option value='0'>Yes</option>
                                <option value='1'>No</option>
                            </Form.Control>
                            </Col>
                        </Form.Group>
                        </Form>
                        </Card.Body>
                        </Card>
                    </CardGroup>
                </div>
        );
    }

    renderAnimalHistory(){
        return(
            <div className="history">
                <div className="page-header">
                    <h5>Appointments history</h5>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Appointment type</th>
                            <th scope="col">Meds administrated</th>
                            <th scope="col">Meds quantity</th>
                        </tr>
                    </thead>
                </table>
            </div>
        );
    }

    renderAnimalTreatments(){
        
    }

    render() {
        let profileData = this.state.loading ?  
            <Spinner animation="border" variant="primary"> 
                <span className="sr-only">Loading...</span>
            </Spinner> : this.renderAnimalProfile();
        return (
            <div>
                {profileData}
                {this.renderAnimalHistory()}
            </div>
        )
    }
}