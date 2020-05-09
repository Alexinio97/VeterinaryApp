import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './stylingComponents/NavMenu.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { faCalendar,faSyringe } from '@fortawesome/free-solid-svg-icons';
import { faUsers , faUserCircle,faUser, faCog, faBell } from '@fortawesome/free-solid-svg-icons';
import { NavDropdown, Button, Badge } from 'react-bootstrap';
import NotificationBadge from 'react-notification-badge';
import {Effect} from 'react-notification-badge';
import { db } from '../firebaseConfig/config';
import { auth } from 'firebase';

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  constructor (props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true,
      count:0,
    };
  }
  componentDidMount(){
    this.listenAppointments();
  }

  toggleNavbar () {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  async listenAppointments(){
       let query = db.collection('Medics').doc(auth().currentUser.uid).collection('Appointments');

      let observer = query.onSnapshot(querySnapshot => {
        console.log(`Received query snapshot of size ${querySnapshot.size}`);
        this.setState({count:querySnapshot.size});
        // ...
      }, err => {
        console.log(`Encountered error: ${err}`);
      });
  }

  render () {
    // TODO: implement cloud messaging from mobile to app and send notifications when an appointment is made from mobile to web app
    // also when a new notification appears store them in firestore and display the number them in the notifications bell button
    // or a real time listener to a notifications collection which has a 20 limts and can be deleted(better this one with notifications)
    return (
      <header>
        <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3 sticky-top" light>
          <Container>
            <NavbarBrand tag={Link} to="/" title="Home"><FontAwesomeIcon icon={faPaw} size="lg"/></NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
              <ul className="navbar-nav flex-grow">
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/fetchClients" title="Clients"><FontAwesomeIcon icon={faUsers} size="lg"/></NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/inventory" title="Inventory"><FontAwesomeIcon icon={faSyringe} size="lg"/></NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/appointments" title="Appointments"><FontAwesomeIcon icon={faCalendar} size="lg"/></NavLink>
                </NavItem>
                <button style={{outline:"none",backgroundColor:"transparent",border:"none"}}>
                <NotificationBadge count={this.state.count} effect={Effect.ROTATE_X} style={{marginRight:"-10px",marginTop:"-5px"}} />
                  <FontAwesomeIcon icon={faBell} size="lg"/>
                </button>
                <NavDropdown id="nav-dropdown" title={<span><FontAwesomeIcon icon={faUserCircle} size="lg"/></span>} style={{marginRight:"20px"}}>
                  <NavDropdown.Item ><Link to="/profile"><FontAwesomeIcon icon={faUser} size="1x"/> Profile</Link></NavDropdown.Item>
                  <NavDropdown.Item><Link to="/settings"><FontAwesomeIcon icon={faCog} size="1x"/> Settings</Link></NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item><Link to="/Logout"><FontAwesomeIcon icon={faSignOutAlt} size="1x"/> Logout </Link></NavDropdown.Item>
                </NavDropdown>
              </ul>
            </Collapse>
          </Container>
        </Navbar>
      </header>
    );
  }
}
