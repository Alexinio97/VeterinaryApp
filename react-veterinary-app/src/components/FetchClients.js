import React, { Component } from 'react';
import { userService } from "../services/user.service";

export class FetchClients extends Component {
  static displayName = FetchClients.name;

  constructor(props) {
    super(props);
    this.state = { medic: [], loading: true };
  }

  componentDidMount() {
    this.populateMedicData();
  }

  static rendermedicTable(medic) {
    return (
      <table className='table table-bordered table-dark' aria-labelledby="clients">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>CNP</th>
          </tr>
        </thead>
        <tbody>
          {medic[0].clients.map(client =>
            <tr key={client.id}>
              <td>{client.firstName}</td>
              <td>{client.lastName}</td>
              <td>{client.email}</td>
              <td>{client.cnp}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  render() {
    let contents = this.state.loading
      ? <img src="https://i.gifer.com/ZKZg.gif" alt="Loading..." height="60" width="60"></img>
      : FetchClients.rendermedicTable(this.state.medic);

    return (
      <div>
        <h1 id="tabelLabel" >Clients</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
    );
  }

  async populateMedicData() {
    userService.getAllMedics().then(medic => this.setState({ medic,loading: false }));
  }
}
