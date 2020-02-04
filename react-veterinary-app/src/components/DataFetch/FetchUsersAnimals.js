import React, { Component } from 'react';
import { animalService } from "../../services/animal.service";
import { Spinner, Button } from 'reactstrap';


// component that will fetch animals owned by the user clicked
export class FetchUsersAnimals extends Component {
  static displayName = FetchUsersAnimals.name;

  constructor(props) {
    super(props);
    this.state = { animals: [], loading: true };
    
  }

  componentDidMount() {
    this.populatetUsersAnimals();
  }

  static renderAnimalsData(animals) {
    return (
      <table className='table table-bordered table-dark' aria-labelledby="animals">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Breed</th>
            <th>Species</th>
            <th>Neutered</th>
          </tr>
        </thead>
        <tbody>
          {animals.map(animal =>
            <tr key={animal.name}>
              <td>{animal.name}</td>
              <td>{animal.age}</td>
              <td>{animal.breed}</td>
              <td>{animal.species}</td>
              <td>{animal.neutered}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  render() {
    let contents = this.state.loading
      ? <Spinner animation="border" variant="primary">
          <span className="sr-only">Loading...</span>
        </Spinner>
      : FetchUsersAnimals.renderAnimalsData(this.state.animals);

    return (
      <div>
        <h1 id="tabelLabel" >{this.props.match.params.clientName} owned pets.</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
    );
  }

  async populatetUsersAnimals() {
    var clientId = this.props.match.params.clientId;
    animalService.getUsersAnimals(clientId).then(animals => this.setState({ animals,loading: false }));
  }
}
