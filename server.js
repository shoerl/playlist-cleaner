import "./constants"

const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');
const publicPath = path.join(__dirname, '..', 'src');
const port = process.env.PORT || 3030;
const axios = require('axios');

app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https')
        return res.redirect('https://' + req.headers.host + req.url);
    else
        return next();
});

let my_client_id = 'a995ddca57104cce9e0bd88f10412212';
let redirect_uri = 'https://playlistcleaner.com/app';
let my_client_secret = '2fcdedf81ae941dc817490d4d213504c';

app.get('/api/login/callback', cors(), function (req, res) {
    let hostname = 'https://accounts.spotify.com/api/token';
    axios({
        method: 'POST',
        url: hostname,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        params: {
            "grant_type": "authorization_code",
            "code": req.query.code,
            "redirect_uri": redirect_uri,
            "client_id": my_client_id,
            "client_secret": my_client_secret
        }
    }).then(response => res.send(response['data']));
})

app.get('/api/login/refresh', cors(), function(req, res) {
    let hostname = 'https://accounts.spotify.com/api/token';
    axios({
        method: 'POST',
        url: hostname,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        params: {
            "grant_type": "refresh_token",
            "refresh_token": req.query.refresh,
            "redirect_uri": redirect_uri,
            "client_id": my_client_id,
            "client_secret": my_client_secret
        }
    }).then(response => res.send(response['data']));
})

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log('Server is up!');
    console.log('Port is: ' + port);
});
