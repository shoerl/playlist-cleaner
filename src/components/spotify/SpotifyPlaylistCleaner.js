import * as React from "react";
import {Button, Card, Modal, OverlayTrigger, Row, Spinner, Tooltip} from "react-bootstrap";

class SpotifyPlaylistCleaner extends React.Component {

    state = {
        access_token: '',
        refresh_token: '',
        user_id: '',
        playlists_info: [],
        temp_uris: [],
        in_progress: false,
        url: 'https://hoerl.io/api/login',
        getting_playlists: false,
    }

    setAccessToken = (access_token) => {
        this.setState({access_token: access_token});
    }


    convertPlaylist = (playlistId, playlistName, explicit) => {
        this.setState({temp_uris: [], in_progress: true}, () => this.getPlaylistTracks(0, playlistId, playlistName, explicit))
    }

    getRefresh = () => {
        fetch("https://hoerl.io/api/login/refresh?refresh=" + this.state.refresh_token).then(resp => resp.json())
            .then(json => this.setAccessToken(json.access_token)).then(() => this.getUserId());
    }


    getUserId = () => {
            fetch("https://api.spotify.com/v1/me", {
                headers: {"Authorization": "Bearer " + this.state.access_token}
            }).then(resp => resp.json())
                .then(json => this.setUserId(json.id));
    }

    setUserId = (userId) => {
        this.setState({user_id: userId}, () => this.getPlaylists(0));
    }

    getPlaylistTracks = async (offset, playlist_id, playlist_name, explicit) => {
        let nextOffset;
        let howManyLeft;
        await fetch("https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks?offset=" + offset, {
            headers: {"Authorization": "Bearer " + this.state.access_token}
        }).then(resp => resp.json())
            .then(async json => {
                nextOffset = json.items.length + offset;
                howManyLeft = json.total - (json.items.length + offset);
                for (let item of json.items) {
                    if (item.track.album.artists.length > 0) {
                         await this.findSong({
                            song_title: item.track.name,
                            album_title: item.track.album.name,
                            artist_name: item.track.album.artists[0].name,
                        }, explicit);
                    }
                }
            }).catch(e => this.getRefresh())
        .finally(() => {
            if (howManyLeft > 0) {
                this.getPlaylistTracks(nextOffset, playlist_id, playlist_name, explicit);
            } else {
                this.makePlaylist(playlist_id, playlist_name, explicit);
            }
        });
    }



    appendPlaylistDataToArray = (playlist) => {
        this.setState({
            playlists_info: [...this.state.playlists_info,
                {
                    href: playlist.href,
                    images: playlist.images,
                    name: playlist.name,
                    id: playlist.id,
                    snapshot_id: playlist.snapshot_id,
                    creator: playlist.owner.display_name,
                    uri: playlist.uri
                }
            ]
        })
    }

    appendPlaylistDataToBackOfArray = (playlist) => {
        this.setState({
            playlists_info: [{
                href: playlist.href,
                images: playlist.images,
                name: playlist.name,
                id: playlist.id,
                snapshot_id: playlist.snapshot_id,
                creator: playlist.owner.display_name,
                uri: playlist.uri
            }, ...this.state.playlists_info]
        })
    }


    // you have to feed this the cleaned up track json
    findSong = async (track, explicit) => {
        await fetch("https://api.spotify.com/v1/search?q=" + encodeURIComponent( "artist:" + track.artist_name + " \"" + track.song_title + "\"") + "&type=track&market=US", {
            headers: {"Authorization": "Bearer " + this.state.access_token,
            "Content-Type": "application/json", "Accept": "application/json"}
        }).then(resp => resp.json())
            .then(async json => {
                for (track of json.tracks.items) {
                    if (track.explicit === explicit) {
                        await this.appendURIToArray(track);
                        break;
                    }
                }
            })

    }




    appendURIToArray = (track) => {
        this.setState({
            temp_uris: [...this.state.temp_uris, track.uri]
        })
    }

    getPlaylists = (offset) => {
        let nextOffset;
        let amountLeft;
        fetch("https://api.spotify.com/v1/me/playlists?offset=" + offset, {
            headers: {"Authorization": "Bearer " + this.state.access_token}
        }).then(resp => resp.json())
            .then(json => {
                nextOffset = json.items.length + offset;
                amountLeft = json.total - (json.items.length + offset);
                json.items.forEach(item => this.appendPlaylistDataToArray(item));
            }).catch(e => this.getRefresh())
            .finally(() => {
            if (amountLeft > 0) {
                this.getPlaylists(nextOffset);
            }
        });
    }


    componentDidMount() {
        this.setState(
            {access_token:this.props.token, refresh_token:this.props.refresh},
            () => this.getRefresh());
    }



    makePlaylist = (playlistId, playlist_name, explicit) => {
        let str;
        if (explicit) { str = "EXPLICIT: "}
        else { str = "CLEAN: "}
         fetch("https://api.spotify.com/v1/users/" + this.state.user_id + "/playlists", {
             headers: {"Authorization": "Bearer " + this.state.access_token, "Content-Type": "application/json", "Accept": "application/json"},
             method: "POST",
             body: JSON.stringify({name: str + playlist_name})
         }).then(resp => resp.json()).then(json => {
             this.addTracksToPlaylist(this.state.temp_uris, json.id);
         })
    }


    addTracksToPlaylist = (uris, id) => {
        let temp;
        if (uris.length > 100) {
            temp = uris.slice(0, 100);
            uris = uris.slice(100);
        } else {
            temp = uris;
            uris = [];
        }
        fetch("https://api.spotify.com/v1/playlists/" + id + "/tracks", {
            headers: {"Authorization": "Bearer " + this.state.access_token, "Content-Type": "application/json", "Accept": "application/json"},
            method: "POST",
            body: JSON.stringify({uris: temp})
        }).then(resp => resp.json()).then(() => {
            if (uris.length > 0) {
                this.addTracksToPlaylist(uris, id)
            } else {
                // add our new playlist to array so we render it
                //TODO: figure out how to pull this out of this function while still making it wait
                fetch("https://api.spotify.com/v1/playlists/" + id, {
                    headers: {"Authorization": "Bearer " + this.state.access_token, "Content-Type": "application/json", "Accept": "application/json"}
                }).then(resp => resp.json()).then(json => this.appendPlaylistDataToBackOfArray(json))
                    .then(() => this.setState({in_progress: false}));
            }
        });
    }


    render() {
        return (
            <div className={"container"}>
                <Modal show={this.state.in_progress} size="lg" centered>
                    <Modal.Header>
                        <Modal.Title className={"text-center mr-auto ml-auto"}>Working... <Spinner animation="border" variant="primary" size="lg" /></Modal.Title>
                    </Modal.Header>
                </Modal>
                {this.state.playlists_info && this.state.playlists_info.length > 0 &&
                <Row className={"mt-2"}>
                    <OverlayTrigger
                        placement="auto"
                        delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip id="button-tooltop">This is because some songs don't have clean versions on Spotify and also because there are some inconsistencies in how Spotify stores everything</Tooltip>}>
                        <Button className={"ml-auto mr-auto"} variant="danger">NOTE: Some songs will be missed</Button>
                    </OverlayTrigger>
                </Row>}
                <Row className={"text-center"}>
                    {this.state.playlists_info && this.state.playlists_info.length > 0 &&
                    this.state.playlists_info.map((playlist) => (
                        <Card key={playlist.id} style={{maxWidth: '300px'}}
                              className="spotify-card pl-0 pr-0 mt-2 mb-2 ml-auto mr-auto col-xl-4 col-lg-4 col-md-6 col-sm-12 col-xs-12">
                            {playlist.images.length > 0 &&
                            <Card.Img variant="top" src={playlist.images[0].url} width={250} height={250}/>}
                            {playlist.images.length <= 0 &&
                            <Card.Img variant="top" src={"music_note.png"} width={250} height={250}/>}
                            <Card.Body>
                                <Card.Title>{playlist.name}</Card.Title>
                                <Card.Text>Created by: {playlist.creator}</Card.Text>
                                <Button variant="success" onClick={() => this.convertPlaylist(playlist.id, playlist.name, false)}>Convert to all clean</Button>
                                <Button className={"mt-1"} variant="danger" onClick={() => this.convertPlaylist(playlist.id, playlist.name, true)}>Convert to all explicit</Button>
                            </Card.Body>
                        </Card>))}
                </Row>
            </div>
        )
    }

}

export default SpotifyPlaylistCleaner
