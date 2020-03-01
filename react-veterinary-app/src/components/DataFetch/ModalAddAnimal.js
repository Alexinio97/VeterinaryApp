import React, { Component } from 'react';
import { Modal,Button} from 'react-bootstrap';
import { Form } from 'react-bootstrap';

export default class ModalAddAnimal extends Component{

    constructor(props){
        super(props);
        this.state = {
            Id:'',
            Name: '',
            Age: '',
            Breed: '',
            Species: '0',
            Neutered: '0',
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleClose()
    {
        this.props.saveModalDetails(this.state);
    }

    componentWillReceiveProps(nextProps) {
        var animalReceived = nextProps.animal;
        console.log(animalReceived);
        if(animalReceived !== null)
        { 
            
            this.setState({
            Id: animalReceived.Id,
            Name: animalReceived.Name,
            Age: animalReceived.Age,
            Breed: animalReceived.Breed,
            Species: animalReceived.Species,
            Neutered: animalReceived.Neutered,
        });
    }
    else{
        this.setState({
            Id:'',
            Name: '',
            Age: '',
            Breed: '',
            Species: '0',
            Neutered: '0',
        });
    }
}

    handleSave() {
        const animal = this.state;
        
        if(animal.Id === '')
        {
            console.log("Animal to add: " + this.state);
            this.props.saveNewAnimal(animal);
        }
        else
        {   
            this.props.saveAnimalChanges(animal);
        }
    }

    handleChange(e) {
        const { name,value } = e.target;
        this.setState({[name]: value});
    }

    render(){
        let animalEditOrAdd = (this.props.animal === null) ? "Add" : "Edit";
        return(
        <Modal {...this.props}>
        <Modal.Header closeButton>
          <Modal.Title>{animalEditOrAdd} animal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div>
        <Form>
            <Form.Group controlId="formGroupName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="Name"  value={this.state.Name} onChange={this.handleChange}/>
            </Form.Group>
            <Form.Group controlId="formGroupAge">
                <Form.Label>Age</Form.Label>
                <Form.Control type="number" name="Age" value={this.state.Age} onChange={this.handleChange}/>
            </Form.Group>
            <Form.Group controlId="formGroupBreed">
                <Form.Label>Breed</Form.Label>
                <Form.Control type="text" name="Breed" value={this.state.Breed} onChange={this.handleChange}/>
            </Form.Group>
            <Form.Group controlId="formGroupSpecies">
                <Form.Label>Species</Form.Label>
                <Form.Control as="select"  name="Species" value={this.state.Species} onChange={this.handleChange}>
                    <option value='0'>Dog</option>
                    <option value='1'>Cat</option>
                    <option value='2'>Bird</option>
                </Form.Control>
            </Form.Group>
            <Form.Group controlId="formGroupNeutered">
                <Form.Label>Neutered</Form.Label>
                <Form.Control as="select"  name="Neutered" value={this.state.Neutered} onChange={this.handleChange}>
                    <option value='0'>Yes</option>
                    <option value='1'>No</option>
                </Form.Control>
            </Form.Group>
            </Form>
        </div>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={this.props.onHide}>
            Close
          </Button>
          <Button variant="primary" onClick={this.handleSave}>
            Save animal
          </Button>
        </Modal.Footer>
      </Modal>
    );
    }
}