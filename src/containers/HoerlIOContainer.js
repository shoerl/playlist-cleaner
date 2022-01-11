import * as React from "react";
import {BrowserRouter as Router, Redirect, Route} from "react-router-dom";
import NavBarComponent from "../components/abstractions/NavBarComponent";
import {SpotifyPlaylist} from "../components/spotify/SpotifyPlaylist";

class HoerlIOContainer extends React.Component {

    render() {
        return (
            <div className="home-page-container container-fluid">
                <Router>
                    <NavBarComponent></NavBarComponent>
                    <Route path="/app" exact={true}
                           render={(props) =>
                               <SpotifyPlaylist
                                   {...props}
                               />}/>
                    <Route path="/" exact={true}>
                        <Redirect to="/app"/>
                    </Route>
                </Router>
            </div>
        )
    }

}

export default HoerlIOContainer
