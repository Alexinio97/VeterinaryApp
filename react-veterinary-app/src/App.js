import logo from './logo.svg';
import './App.css';
import { Route } from 'react-router';
import React, {Component} from 'react';
import { PrivateRoute } from './components/PrivateRoute';
import {HomePage } from '../src/Pages/HomePage';
import {LoginPage} from '../src/Pages/LoginPage';
import { Layout } from './components/Layout';
import { FetchClients } from './components/DataFetch/FetchClients';
import { FetchUsersAnimals } from './components/DataFetch/FetchUsersAnimals';

export default class App extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isVisible: false,
      };
  }

  updateModal(isVisible) {
    this.state.isVisible = isVisible;
    this.forceUpdate();
  }

  render() {
      return (
        <div className="App"> 
          <Layout>
              <Route path="/login" component={LoginPage} />
              <PrivateRoute exact path="/" component={HomePage} />
              <PrivateRoute exact path="/fetchClients" component={FetchClients} />
              <PrivateRoute exact path="/userAnimals/:clientName/:clientId" component={FetchUsersAnimals} name="userAnimals"/>
          </Layout>
        </div> 
      )
  }
}


