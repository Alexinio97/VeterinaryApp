
import './App.css';
import { Route } from 'react-router';
import React, {Component} from 'react';
import {HomePage } from '../src/Pages/HomePage';
import {LoginPage} from '../src/Pages/LoginPage';
import { Layout } from './components/Layout';
import { FetchClients } from './components/DataFetch/FetchClients';
import { FetchUsersAnimals } from './components/DataFetch/FetchUsersAnimals';
import { Appointments} from './components/DataFetch/FetchAppointments';
import { auth } from 'firebase';
import { Logout } from './Pages/Logout';
import { PrivateRoute } from './components/PrivateRoute';
import { AnimalPage } from './Pages/AnimalPage';

export default class App extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isVisible: false,
        isLoggedIn: false,
        currentUser: null,
      };
      
    
      this.setUserLoggedIn = this.setUserLoggedIn.bind(this);
  }


  componentDidMount(){
    this.removeAuthListener = auth().onAuthStateChanged( user => {
      if(user){
        this.setState({
          isLoggedIn:true,
          currentUser:user,
        })
      }
      else{
        this.setState({
          isLoggedIn:false,
          currentUser:null
        })
      }
    })
  }

  componentWillUnmount()
  {
    this.removeAuthListener();
  }


  async setUserLoggedIn(response){
    if(response) {
      localStorage.setItem("medicId",response.user.uid);
      this.setState({
        currentUser:response.user,
        isLoggedIn:true,
      })
    }
    else
    {
      this.setState({
        currentUser:null,
        isLoggedIn:false,
      })
    }
  }

  

  render() {
    console.log("From appjs: " + this.state.isLoggedIn);
    let content = (this.state.isLoggedIn ) ? <Layout/> : '';
    return (
      <div className="App">
        {content} 
        <Route exact path="/logout" component={Logout} />
        <PrivateRoute  exact path="/"   authenticated={this.state.isLoggedIn} component={HomePage} medic={this.state.currentUser} />
        <PrivateRoute  exact path="/fetchClients"  authenticated={this.state.isLoggedIn} component={FetchClients} />
        <PrivateRoute  exact path="/appointments"  authenticated={this.state.isLoggedIn} component={Appointments} />
        <PrivateRoute  exact 
        authenticated={this.state.isLoggedIn}
        path="/userAnimals/:clientName/:clientId" 
        component={FetchUsersAnimals} name="userAnimals"/>
        <Route exact path="/login" render={(props) => {
                  return <LoginPage setUserLoggedIn={this.setUserLoggedIn} authenticated={this.state.isLoggedIn} {...props} />
                }} />
        <PrivateRoute exact 
        path="/animalPage" 
        component={AnimalPage}
        authenticated={this.state.isLoggedIn} 
        name="animalPage"/>
      </div> 
      )
  }
}


