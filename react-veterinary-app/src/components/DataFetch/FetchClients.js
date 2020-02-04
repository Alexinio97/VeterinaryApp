import React, { Component } from 'react';
import { userService } from "../../services/user.service";
import { Spinner, Button, NavLink } from 'reactstrap';
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
      <table className='table table-bordered table-white' aria-labelledby="clients">
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
            <tr key={client.id}>
              <td>{client.firstName}</td>
              <td>{client.lastName}</td>
              <td>{client.email}</td>
              <td>             
                <Link to={`userAnimals/${client.lastName}/${client.id}`}>
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
    userService.getAllClients().then(clients => this.setState({ clients,loading: false }));
  }
}
