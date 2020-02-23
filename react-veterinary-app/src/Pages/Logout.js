import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import {Spinner} from 'react-bootstrap';
import { auth } from 'firebase';

export class Logout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      redirect: false
    }
  }

  componentDidMount() {
      this.logoutUser();
  }

  logoutUser()
  {
    localStorage.removeItem('medicId');
    auth().signOut().then((user) => {
        this.setState({ redirect: true })
    })
  }

  render() {
    if (this.state.redirect === true) {
      return <Redirect to="/login" />
    }

    return (
      <div style={{ textAlign: "center", position: "absolute", top: "25%", left: "50%" }}>
       <Spinner animation="border" variant="primary">
       <span className="sr-only">Logging out...</span>
       </Spinner>
      </div>
    )
  }
}

