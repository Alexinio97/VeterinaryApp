import React, { Component } from 'react';
import { medicService } from "../../services/medic.service";
import { Spinner, Button } from 'reactstrap';
import { Link } from 'react-router-dom';

// component that fetches the clients of the medic logged in
export class FetchClients extends Component {
  static displayName = FetchClients.name;

  constructor(props) {
    super(props);
    this.state = { clients: [], loading: true };
  }

  componentDidMount() {
    this.populateClientsData();
  }

  static renderClientsTable(clients) {
    return (
      <table className='table table-bordered table-white ' aria-labelledby="clients" style={{width:"80%",marginLeft:"auto",marginRight:"auto"}}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Animals owned</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client =>
            <tr key={client.Id}>
              <td>{client.FirstName}</td>
              <td>{client.LastName}</td>
              <td>{client.Email}</td>
              <td>             
                <Link to={`userAnimals/${client.LastName}/${client.Id}`}>
                  <Button className="btn btn-primary">View Animals</Button>
                </Link>             
              </td>
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
      : FetchClients.renderClientsTable(this.state.clients);

    return (
      <div>
        <h1 id="tabelLabel" >Clients</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
    );
  }

  async populateClientsData() {
    await medicService.getAllClients().then(clients => this.setState({ clients,loading: false }));
    console.log(this.state.clients);
  }
}
