import {Nav, Navbar} from "react-bootstrap";
import * as React from "react";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpotify} from "@fortawesome/free-brands-svg-icons/faSpotify";
import {faItunes} from "@fortawesome/free-brands-svg-icons/faItunes";
import './NavBarStyles.css'

class NavBarComponent extends React.Component {


    render() {
        return (
            <Navbar bg="dark" expand={true} variant="dark" className={"ml-auto mr-auto"} style={{maxWidth: "900px"}}>
                <Navbar.Brand href="/app" className="nav-text">
                    <h2>Playlist Cleaner</h2>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav variant="pills" defaultActiveKey="/app" className="ml-auto mr-3 buttons-container">
                        <NavLink className="nav-text nav-link mr-2" to="/none"><FontAwesomeIcon className={""} icon={faItunes} size={"3x"}/></NavLink>
                        <NavLink className="nav-text nav-link" to="/app"><FontAwesomeIcon className={""} icon={faSpotify} size={"3x"}/></NavLink>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default NavBarComponent
