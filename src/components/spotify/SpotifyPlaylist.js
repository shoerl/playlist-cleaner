import * as React from "react";
import Cookies from 'js-cookie';
import SpotifyPlaylistCleaner from "./SpotifyPlaylistCleaner";
import {SpotifyPlaylistAuthenticator} from "./SpotifyPlaylistAuthenticator";
import {useLocation} from "react-router-dom";

export const SpotifyPlaylist = () => {
    const token = Cookies.get('access_token');
    const refresh = Cookies.get('refresh_token');
    const location = useLocation();
    const url = new URLSearchParams(location.search);

    return (
        <div className='app'>
            {token ?
                (<SpotifyPlaylistCleaner token={token} refresh={refresh}/>) :
                (<SpotifyPlaylistAuthenticator code={url.get('code')}/>)
            }
        </div>
    )
}
