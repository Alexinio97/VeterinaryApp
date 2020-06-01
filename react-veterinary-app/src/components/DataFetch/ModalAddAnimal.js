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
            Photo:null,
            errors:{},
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangePhoto = this.handleChangePhoto.bind(this);
    }

    handleClose()
    {
        this.props.saveModalDetails(this.state);
    }

    validateInput(animal){
        let errors = {};
        let isValid = true;
        console.log(animal.Age);
        if(animal.Name.length < 1){
            errors["name"] = "Va rugam completati numele!";
            isValid = false;
        }
        if(animal.Breed.length < 1){
            errors["breed"] = "Va rugam adaugati rasa!";
            isValid = false;
        }
        if(animal.Name.match(/\d+/g) != null)
        {
            errors["name"] = "Nu se pot adauga numere!";
            isValid = false;
        }
        if(animal.Breed.match(/\d+/g) != null)
        {
            errors["breed"] = "Nu se pot adauga numere!";
            isValid = false;
        }
        
        if(animal.Age < 1 )
        {
            errors["age"] = "Te rugam adauga o varsta valida!";
            isValid = false;
        }

        this.setState({errors:errors});
        return isValid;
    }

    componentDidUpdate(prevProps ) {
        if(prevProps.animal!==this.props.animal){
            
            if(this.props.animal !== null)
            { 
                let animalReceived = this.props.animal.animaltoEdit;
                console.log(animalReceived);
                this.setState({
                Id: animalReceived.Id,
                Name: animalReceived.Name,
                Age: animalReceived.Age,
                Breed: animalReceived.Breed,
                Species: animalReceived.Species,
                Neutered: animalReceived.Neutered,
                Photo: animalReceived.Photo,
                errors:{},
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
                Photo:null,
                errors:{},
            });
        }
    }
}

    handleSave() {
        const animal = this.state;
        let result = this.validateInput(animal);
        if(result === false){
            return;
        }
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

    handleChangePhoto(e){
        if (e.target.files[0]) {
          const Photo = e.target.files[0];
          this.setState(() => ({Photo:Photo }));
          console.log(this.state);
        }
      };

    

    render(){
        let animalEditOrAdd = (this.props.animal === null) ? "Add" : "Edit";
        return(
        <Modal {...this.props}>
        <Modal.Header closeButton>
          <Modal.Title>{animalEditOrAdd} animal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div>
        <Form noValidate>
            <div className="custom-file">
                <input type="file" className="custom-file-input" name="Photo" id="customFile" onChange={this.handleChangePhoto}/>
                <label className="custom-file-label" for="customFile">{(this.state.Photo !==undefined && this.state.Photo !== null)
                                                                     ? this.state.Photo.name || this.state.Photo : "Choose Photo..."}</label>
            </div>
            <Form.Group controlId="formGroupName">
                <Form.Label>Nume</Form.Label>
                <Form.Control type="text" name="Name" required value={this.state.Name} onChange={this.handleChange}/>
                <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["name"]}</b></span>
            </Form.Group>
            <Form.Group controlId="formGroupAge">
                <Form.Label>Varsta</Form.Label>
                <Form.Control type="number" name="Age" value={this.state.Age} onChange={this.handleChange}/>
                <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["age"]}</b></span>
            </Form.Group>
            <Form.Group controlId="formGroupBreed">
                <Form.Label>Rasa</Form.Label>
                <Form.Control type="text" name="Breed" value={this.state.Breed} onChange={this.handleChange}/>
                <span style={{color:"red",fontSize:"12px"}}><b>{this.state.errors["breed"]}</b></span>
            </Form.Group>
            <Form.Group controlId="formGroupSpecies">
                <Form.Label>Specie</Form.Label>
                <Form.Control as="select"  name="Species" value={this.state.Species} onChange={this.handleChange}>
                    <option value='0'>Caine</option>
                    <option value='1'>Pisica</option>
                </Form.Control>
            </Form.Group>
            {(this.state.Species === 2) ? "" :
            <Form.Group controlId="formGroupNeutered">
                <Form.Label>Neutered</Form.Label>
                
                <Form.Control as="select"  name="Neutered" value={this.state.Neutered} onChange={this.handleChange}>
                    <option value='0'>Da</option>
                    <option value='1'>Nu</option>
                </Form.Control>
            </Form.Group>
            }
            </Form>
        </div>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={this.props.onHide}>
            Inchide
          </Button>
          <Button variant="primary" onClick={this.handleSave}>
            Salveaza animal
          </Button>
        </Modal.Footer>
      </Modal>
    );
    }
}