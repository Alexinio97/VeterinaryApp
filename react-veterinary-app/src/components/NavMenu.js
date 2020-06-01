import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, PopoverHeader, PopoverBody, Popover } from 'reactstrap';
import { Link } from 'react-router-dom';
import './stylingComponents/NavMenu.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import { faCalendar,faSyringe } from '@fortawesome/free-solid-svg-icons';
import { faUsers , faUserCircle,faUser, faCog, faBell } from '@fortawesome/free-solid-svg-icons';
import { NavDropdown, Toast } from 'react-bootstrap';
import NotificationBadge from 'react-notification-badge';
import {Effect} from 'react-notification-badge';
import { db } from '../firebaseConfig/config';
import { auth } from 'firebase';
import { medicService } from '../services/medic.service';
import { formatDistance } from 'date-fns/esm';
import moment from 'moment';

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  constructor (props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true,
      count:0,
      notifications: [],
      showNotifications:false,
      redirectToClients:false,
    };
  }
  componentDidMount(){
    this.fetchNofications();
  }

  toggleNavbar () {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  async fetchNofications(){
        let query = db.collection('Medics').doc(auth().currentUser.uid).collection('Notifications');
        
        let observer = query.onSnapshot(querySnapshot => {
            let notifications = []
            querySnapshot.forEach( notification =>{
                let newNotification = notification.data();
                newNotification["Id"] = notification.id;
                notifications.push(newNotification);
            });
            console.log(notifications);
            this.setState({notifications:notifications,count:notifications.length});
            console.log(observer);
        }, err => {
            console.log(`Encountered error: ${err}`);
        });
  }

  deleteNotification(id){
    console.log("Notification to delete: ",id);
    medicService.deleteNotification(id);
  }

  handleClick(type){
    console.log(type);
    if(type === "New Client"){
      console.log("Inside if");
      this.setState({redirectToClients:true});
    }
  }

  renderNotifications(){
    let cards = [];
    console.log(new Date());
    this.state.notifications.map(notification => {
        var dateStr = notification.timeStamp.split(".").join('/');
        console.log(dateStr)
        let convertedDate = new Date(notification.timeStamp);
        console.log(convertedDate); 
        cards.push(
            <Toast id={notification.Id}  onClick={() => this.handleClick(notification.type)} onClose={() => this.deleteNotification(notification.Id)}>
                <Toast.Header>
                <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
                <strong className="mr-auto">{notification.type}</strong>
                <small>{formatDistance(convertedDate,new Date(),{ addSuffix: true })}</small>
                </Toast.Header>
                <Toast.Body>{notification.description}</Toast.Body>
            </Toast>
        );
    });
    return cards;
}
  displayNotifications(){
    if(this.state.showNotifications === false)
    {
      this.setState({showNotifications:true});
    }
    else
    {
      // delete viewed notifications
      if(this.state.notifications.length > 0)
      {
          this.state.notifications.map(async notif => {
          await medicService.deleteNotification(notif.Id);
        });
      }
      this.setState({showNotifications:false});
    }
  }

  render () {
    let notifications = (this.state.showNotifications) ? this.renderNotifications() : "";
    // TODO: implement cloud messaging from mobile to app and send notifications when an appointment is made from mobile to web app
    // also when a new notification appears store them in firestore and display the number them in the notifications bell button
    // or a real time listener to a notifications collection which has a 20 limts and can be deleted(better this one with notifications)
    return (
      <div>
      <header>
        <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3 sticky-top" light>
          <Container>
            <NavbarBrand tag={Link} to="/" title="Acasa"><FontAwesomeIcon icon={faPaw} size="lg"/></NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
              <ul className="navbar-nav flex-grow">
              <button className="btn" id="activityInfo" style={{outline:"none"}} onClick={() => this.displayNotifications()}>
                  <NotificationBadge count={this.state.count} effect={Effect.ROTATE_X} style={{marginRight:"-10px",marginTop:"-5px"}} />
                    <FontAwesomeIcon icon={faBell} size="lg"/>
              </button>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/fetchClients" title="Clienti"><FontAwesomeIcon icon={faUsers} size="lg"/></NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/inventory" title="Inventar"><FontAwesomeIcon icon={faSyringe} size="lg"/></NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/appointments" title="Programari"><FontAwesomeIcon icon={faCalendar} size="lg"/></NavLink>
                </NavItem>
                <NavDropdown id="nav-dropdown" title={<span><FontAwesomeIcon icon={faUserCircle} size="lg"/></span>} style={{marginRight:"20px"}}>
                  <NavDropdown.Item ><Link to="/profile"><FontAwesomeIcon icon={faUser} size="1x"/> Profil</Link></NavDropdown.Item>
                  <NavDropdown.Item><Link to="/settings"><FontAwesomeIcon icon={faCog} size="1x"/> Setari</Link></NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item><Link to="/Logout"><FontAwesomeIcon icon={faSignOutAlt} size="1x"/> Iesire </Link></NavDropdown.Item>
                </NavDropdown>
              </ul>
            </Collapse>
          </Container>
        </Navbar>
      </header>
      <body>
      <Popover style={{width:"370px"}} placement="bottom" isOpen={this.state.showNotifications} target="activityInfo">
                            <PopoverHeader>Notificari</PopoverHeader>
                            <PopoverBody>
                                {(notifications.length > 0) ? notifications : "Nici-o notificare noua"}
                            </PopoverBody>
              </Popover>
      </body>
      </div>
    );
  }
}
