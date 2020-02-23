import logo from './logo.svg';
import './App.css';
import { Route, Switch } from 'react-router';
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
import { BrowserRouter } from 'react-router-dom';


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
  updateModal(isVisible) {
    this.state.isVisible = isVisible;
    this.forceUpdate();
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

  updateModal(isVisible) {
    this.state.isVisible = isVisible;
    this.forceUpdate();
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

  renderNavBar()
  {
    return(
      <Layout>
        <PrivateRoute  exact path="/"   authenticated={this.state.isLoggedIn} component={HomePage} medic={this.state.currentUser} />
        <PrivateRoute  exact path="/fetchClients"  authenticated={this.state.isLoggedIn} component={FetchClients} />
        <PrivateRoute  exact path="/appointments"  authenticated={this.state.isLoggedIn} component={Appointments} />
        <PrivateRoute  exact 
        authenticated={this.state.isLoggedIn}
        path="/userAnimals/:clientName/:clientId" 
        component={FetchUsersAnimals} name="userAnimals"/>
      </Layout>
    );
  }

  render() {
    console.log("From appjs: " + this.state.isLoggedIn);
    let content = (this.state.isLoggedIn ) ? this.renderNavBar() : '';
    return (
      <div className="App">
        <Route exact path="/login" render={props => {
         return <LoginPage setUserLoggedIn={this.setUserLoggedIn} {...props}/>}}/>
        <Route exact path="/logout" component={Logout} />
        {content}   
      </div> 
      )
  }
}


