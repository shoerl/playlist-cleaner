import * as React from "react";
import {Button, Row} from "react-bootstrap";
import Cookies from 'js-cookie';
import {useHistory} from "react-router";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpotify} from "@fortawesome/free-brands-svg-icons/faSpotify";
import {APP_URL, API_LOGIN_URL} from "../../constants"

export const SpotifyPlaylistAuthenticator = (props) => {
    const history = useHistory();

    function saveTokens(json) {
        Cookies.set('access_token', json.access_token);
        Cookies.set('refresh_token', json.refresh_token);
        return json;
    }

    function getToken(code) {
        let url = API_LOGIN_URL + '/callback?code=' + code;
        fetch(url).then(resp => resp.json())
            .then(json => saveTokens(json)).then(json => history.push({
            pathname: "app",
            state: {access_token: json.access_token, refresh_token: json.refresh_token}
        }));

    }

    function getAuthToken() {
        let my_client_id = 'a995ddca57104cce9e0bd88f10412212';
        let redirect_uri = APP_URL;
        let scopes = 'user-read-private user-library-modify playlist-modify-public playlist-modify-private playlist-read-private';
        window.open('https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + my_client_id +
            (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
            '&redirect_uri=' + encodeURIComponent(redirect_uri),"_self", 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=800,height=600');
    }

    return (
        <div className={"container"}>
            {props.code ? (<script>{getToken(props.code)}</script>) :
                (<Row className={"text-center"}>
                    <Button style={{backgroundColor: "#1db954", borderColor: "#1db954", borderRadius: ".5rem"}}
                            className={"ml-auto mr-auto mt-2 d-flex align-items-center"}
                            onClick={() => getAuthToken()}>
                        <FontAwesomeIcon className={""} icon={faSpotify} size={"2x"}/> <span className={"ml-2"}>Login with Spotify</span>
                    </Button>
                </Row>)}
        </div>
        )

}
