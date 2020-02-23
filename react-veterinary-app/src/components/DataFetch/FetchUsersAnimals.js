import React, { Component } from 'react';
import { animalService } from "../../services/animal.service";
import { Spinner, Button, Table } from 'reactstrap';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import ModalAddAnimal from './ModalAddAnimal';
import { Modal } from 'react-bootstrap';
import {db} from '../../firebaseConfig/config';



// component that will fetch animals owned by the user clicked
export class FetchUsersAnimals extends Component {
  static displayName = FetchUsersAnimals.name;

  constructor(props) {
    super(props);
    this.state = { animals: [], loading: true,
      animaltoEdit: null,
      showModal:false,
      deleteModal: false,
      animaltoDelete: null,
    }; 

    this.renderAnimalsData = this.renderAnimalsData.bind(this);
    this.populatetUsersAnimals = this.populatetUsersAnimals.bind(this);
    this.editModalAnimal = this.editModalAnimal.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.saveAnimalChanges = this.saveAnimalChanges.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.saveNewAnimal = this.saveNewAnimal.bind(this);
  }

  
  
componentDidMount() {
    this.populatetUsersAnimals();
  }

editModalAnimal(animal){
  this.setState({animaltoEdit : animal});
}

handleShow(animalEdit)
{
  this.setState({animaltoEdit: animalEdit});
  this.setState({
    showModal : true
  });
}

handleAdd()
{
  this.setState({
    animaltoEdit: null,
    showModal:true
  });
}

async saveAnimalChanges(animal) {
  this.setState({showModal: false});
  // updating animal to database
  animal.Age = Number(animal.Age);
  animal.Neutered = Number(animal.Neutered);
  animal.Species = Number(animal.Species)
  await animalService.UpdateAnimal(animal,this.props.match.params.clientId);
  await this.populatetUsersAnimals();
}

async saveNewAnimal(animal){
    this.setState({showModal: false});
    // updating animal to database
    console.log("Animal to add:" + animal);
    animal.Age = Number(animal.Age);
    animal.Neutered = Number(animal.Neutered);
    animal.Species = Number(animal.Species);
    await animalService.AddAnimal(animal,this.props.match.params.clientId);
    await this.populatetUsersAnimals();
}


async confirmDelete()
{
  this.setState({deleteModal: false});
  console.log("Delete confirmed");
  animalService.DeleteAnimal(this.state.animaltoDelete.Id,this.props.match.params.clientId);
  await this.populatetUsersAnimals();
}


renderAnimalsData(animals) {
  var species = [ "Dog","Cat","Reptile"];
  var neutered = [ "Yes","No"];
  return (
    <Table className="table">
      <thead className="thead-dark">
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Age</th>
          <th scope="col">Breed</th>
          <th scope="col">Species</th>
          <th scope="col">Neutered</th>
          <th><Button data-toggle="modal" onClick={() => this.handleAdd()}><FontAwesomeIcon icon={faPlusSquare}/> Add animal</Button></th>
        </tr>
      </thead>
      <tbody>
      {animals.map(animal =>
          <tr key={animal.Id}>
            <td>{animal.Name}</td>
            <td>{animal.Age}</td>
            <td>{animal.Breed}</td>
            <td>{species[animal.Species]}</td>
            <td>{neutered[animal.Neutered]}</td>
            <td>
              <button className="btn" title="Edit" data-toggle="modal" data-target="#editModal" onClick={ () => this.handleShow(animal)}
                ><FontAwesomeIcon icon={faEdit} color="blue"/>
              </button> 
              <button className="btn" title="Delete" data-toggle="modal" data-target="#deleteModal" onClick= { () => this.setState(this.setState({
                                                                                                                          deleteModal:true,
                                                                                                                          animaltoDelete:animal})) }
                ><FontAwesomeIcon icon={faTrash} color="red"/>
              </button> 
            </td>
          </tr>
        )}       
      </tbody>
    </Table>
  );
}


  render() {
    let addModalClose = () => this.setState({showModal:false})
    let deleteModalClose = () => this.setState({deleteModal:false}) 
        
    let contents = this.state.loading
      ? <Spinner animation="border" variant="primary">
          <span className="sr-only">Loading...</span>
        </Spinner>
      : this.renderAnimalsData(this.state.animals);

    return (
      <div>
        <h1 id="tabelLabel" >{this.props.match.params.clientName} owned pets.</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
        <ModalAddAnimal
          animal={this.state.animaltoEdit}
          show={this.state.showModal}
          onHide={addModalClose}
          saveAnimalChanges={this.saveAnimalChanges}
          saveNewAnimal={this.saveNewAnimal}
        />
       <DeleteModal
        props={this.state.deleteModal}
        confirmDelete={this.confirmDelete}
        onHide={deleteModalClose}
        show={this.state.deleteModal}
    />
        
      </div>
    );

  }

  async populatetUsersAnimals() {
    var clientId = this.props.match.params.clientId;
    await animalService.getUsersAnimals(clientId).then( animals => this.setState({animals,loading: false}));
    console.log(this.state.animals);
  }
}

function DeleteModal(props)
{
  console.log(props);
  return(
    <Modal {...props}>
      <Modal.Header closeButton onClick={props.onHide}>
        <Modal.Title>Deleting animal</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Are you sure you want to delete this animal?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button className="btn btn-danger" onClick={props.confirmDelete}>Yes</Button>
        <Button variant="primary" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}