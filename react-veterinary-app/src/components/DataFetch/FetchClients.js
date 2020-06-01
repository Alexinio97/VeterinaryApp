import React, { Component } from 'react';
import { medicService } from "../../services/medic.service";
import { Spinner, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { TextField } from '@material-ui/core';
import '../stylingComponents/FetchData.css';

// component that fetches the clients of the medic logged in
export class FetchClients extends Component {
  static displayName = FetchClients.name;

  constructor(props) {
    super(props);
    this.state = { 
      clients: [], 
      loading: true,
      clientSearched:null,
      tableData:[],
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
    this.populateClientsData();
  }

  renderClientsTable(clients) {
    return (
      <table className='table table-bordered table-white ' aria-labelledby="clients" style={{width:"80%",marginLeft:"auto",marginRight:"auto"}}>
        <thead>
          <tr>
            <th>Prenume</th>
            <th>Nume</th>
            <th>Email</th>
            <th>Animale detinute</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client =>
            <tr key={client.Id}>
              <td>{client.FirstName}</td>
              <td>{client.LastName}</td>
              <td>{client.Email}</td>
              <td>             
                <Link to={`userAnimals/${client.LastName}_${client.FirstName}/${client.Id}/${client.Email}`}>
                  <Button className="btn btn-primary">Vezi animale</Button>
                </Link>             
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  handleSearch(e){
    console.log(e.target.value);
    let clientName = e.target.value;
    let clientsFiltered = [];
    this.setState({clientSearched:clientName});
    if(clientName !== ""){
        this.state.clients.map(client => 
          {
              if(client.FirstName.toLowerCase().includes(clientName.toLowerCase()) || 
                          client.LastName.toLowerCase().includes(clientName.toLowerCase()))
              {
                clientsFiltered.push(client);
              }
          });
        this.setState({tableData:clientsFiltered});
    }
    else{
      this.setState({tableData:this.state.clients});
    }
  }

  render() {
    let contents = this.state.loading
      ? <Spinner animation="border" variant="primary">
          <span className="sr-only">Asteapta...</span>
        </Spinner>
      : this.renderClientsTable(this.state.tableData);

    return (
      <div>
        <h1 id="tabelLabel" >Clienti</h1>
        <div className="search">
          <TextField placeholder="Cauta..." className="col-3" value={this.state.clientSearched} onChange={this.handleSearch}></TextField>
        </div>
        {contents}
      </div>
    );
  }

  async populateClientsData() {
    await medicService.getAllClients().then(clients => this.setState({ clients,loading: false,tableData:clients }));
    console.log(this.state.clients);
  }
}
