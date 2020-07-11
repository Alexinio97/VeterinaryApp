import React, { Component } from 'react';
import { animalService } from "../../services/animal.service";
import { Spinner, Button, Table } from 'reactstrap';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare,faDog,faCat } from '@fortawesome/free-solid-svg-icons';
import ModalAddAnimal from './ModalAddAnimal';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { storage } from '../../firebaseConfig/config';
import '../stylingComponents/FetchData.css';
import { TextField } from '@material-ui/core';


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
      clientId: this.props.match.params.clientId,
      animalSearched:null,
      tableData:[],
    }; 

    this.renderAnimalsData = this.renderAnimalsData.bind(this);
    this.populatetUsersAnimals = this.populatetUsersAnimals.bind(this);
    this.editModalAnimal = this.editModalAnimal.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.saveAnimalChanges = this.saveAnimalChanges.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.saveNewAnimal = this.saveNewAnimal.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  
  
componentDidMount() {
    this.populatetUsersAnimals();
  }

editModalAnimal(animal){
  this.setState({animaltoEdit : animal});
}

handleShow(animalEdit)
{
  console.log(animalEdit);
  this.setState({animaltoEdit: animalEdit,showModal : true});
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
  animal.Species = Number(animal.Species);
  if(typeof(animal.Photo) !== String)
  {
    await this.uploadPhoto(animal.Photo);
    animal.Photo = animal.Photo.name;
  }
  await animalService.UpdateAnimal(animal,this.props.match.params.clientId);
  await this.populatetUsersAnimals();
}

async uploadPhoto(photo){
  if(photo !== null)
  {
    let uploadTask = storage.ref(`animalProfilePics/${photo.name}`).put(photo);

    uploadTask.on('state_changed', snapshot => {
      let progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    },function(error) {
      console.log("Error uploading file: " + error.message);
    },function() {
      uploadTask.snapshot.ref.getDownloadURL().then(function(donwloadUrl) {
        console.log('File available at', donwloadUrl);
      });
    });
  }
}

async saveNewAnimal(animal){
    this.setState({showModal: false});
    // updating animal to database
    console.log("Animal to add:" + animal);
    animal.Age = Number(animal.Age);
    animal.Neutered = Number(animal.Neutered);
    animal.Species = Number(animal.Species);
    if(animal.Photo !== null)
    {
      await this.uploadPhoto(animal.Photo);
      animal.Photo = animal.Photo.name;
    }
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

checkAnimalType(animalType){
   var typeArr = [faDog,faCat];
   return typeArr[animalType];
}

renderAnimalsData(animals) {
  var species = [ "Caine","Pisica"];
  var neutered = [ "Da","Nu"];
  return (
    <Table className="table table-hover" style={{width:"80%",marginLeft:"auto",marginRight:"auto"}}>
      <thead className="thead-dark">
        <tr>
          <th scope="col">Profil</th>
          <th scope="col">Nume</th>
          <th scope="col">Varsta</th>
          <th scope="col">Rasa</th>
          <th scope="col">Specie</th>
          <th scope="col">Sterilizat/Castrat</th>
          <th><Button data-toggle="modal" onClick={() => this.handleAdd()}><FontAwesomeIcon icon={faPlusSquare}/> Adauga animal</Button></th>
        </tr>
      </thead>
      <tbody>
      {animals.map(animal =>
          <tr   key={animal.Id}>
          <td className="link" title="Vezi profilul animalului">
            <Link to={{
              pathname: '/animalPage',
              state: {clientId: this.state.clientId,animal: animal,clientName:this.props.match.params.clientName,
              clientEmail:this.props.match.params.clientEmail}
            }}>
              <FontAwesomeIcon icon={this.checkAnimalType(animal.Species)} size="2x"/> 
            </Link>
          </td>
            <td>{animal.Name}</td>
            <td>{animal.Age}</td>
            <td>{animal.Breed}</td>
            <td>{species[animal.Species]}</td>
            <td>{neutered[animal.Neutered]}</td>
            <td>
              <button className="btn" title="Editeaza" data-toggle="modal" data-target="#editModal" onClick={ () => this.handleShow({animaltoEdit:animal})}
                ><FontAwesomeIcon icon={faEdit} color="blue"/>
              </button> 
              <button className="btn" title="Sterge" data-toggle="modal" data-target="#deleteModal" onClick= { () => this.setState(this.setState({
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

  handleSearch(e){
    let animalName = e.target.value;
    let animalsFiltered = [];
    this.setState({animalSearched:animalName});
    if(animalName !== ""){
        this.state.animals.map(animal => 
          {
              if(animal.Name.toLowerCase().includes(animalName.toLowerCase()))
              {
                animalsFiltered.push(animal);
              }
          });
        this.setState({tableData:animalsFiltered});
    }
    else{
      this.setState({tableData:this.state.animals});
    }
  }


  render() {
    let addModalClose = () => this.setState({showModal:false})
    let deleteModalClose = () => this.setState({deleteModal:false}) 
        
    let contents = this.state.loading
      ? <Spinner animation="border" variant="primary">
          <span className="sr-only">Asteapta...</span>
        </Spinner>
      : this.renderAnimalsData(this.state.tableData);

    return (
      <div>
        <h1 id="tabelLabel" >Animalele detinute de {this.props.match.params.clientName.replace("_"," ")}</h1>
        <div className="search">
          <TextField placeholder="Cauta..." className="col-3" value={this.state.animalSearched} onChange={this.handleSearch}></TextField>
        </div>
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
    var clientId = this.state.clientId;
    await animalService.getUsersAnimals(clientId).then( animals => this.setState({animals,loading: false,tableData:animals}))
    .catch(errorM => console.log("Error occured:  "+ errorM.message));
  }
}

function DeleteModal(props)
{
  console.log(props);
  return(
    <Modal {...props}>
      <Modal.Header closeButton onClick={props.onHide}>
        <Modal.Title>Sterge animal</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Sunteti sigur ca doriti sa stergeti acest animal?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button className="btn btn-danger" onClick={props.confirmDelete}>Da</Button>
        <Button variant="primary" onClick={props.onHide}>Nu</Button>
      </Modal.Footer>
    </Modal>
  );
}