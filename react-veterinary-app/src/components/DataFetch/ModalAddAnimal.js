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
        };
        this.handleSave = this.handleSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangePhoto = this.handleChangePhoto.bind(this);
    }

    handleClose()
    {
        this.props.saveModalDetails(this.state);
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
                Photo: animalReceived.Photo
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
                Photo:null
            });
        }
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
        <Form>
            <div class="custom-file">
                <input type="file" class="custom-file-input" name="Photo" id="customFile" onChange={this.handleChangePhoto}/>
                <label class="custom-file-label" for="customFile">{(this.state.Photo !==undefined && this.state.Photo !== null)
                                                                     ? this.state.Photo.name || this.state.Photo : "Choose Photo..."}</label>
            </div>
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
                </Form.Control>
            </Form.Group>
            {(this.state.Species === 2) ? "" :
            <Form.Group controlId="formGroupNeutered">
                <Form.Label>Neutered</Form.Label>
                
                <Form.Control as="select"  name="Neutered" value={this.state.Neutered} onChange={this.handleChange}>
                    <option value='0'>Yes</option>
                    <option value='1'>No</option>
                </Form.Control>
            </Form.Group>
            }
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