require('dotenv').config();
const express = require("express");
const axios = require('axios');
const cors = require("cors");
const crypto = require('crypto');
const mongodb = require('mongodb');
const { client, dbName, connectToMongoDB } = require('./db_connect.js');
const { connect } = require('http2');
const fetch = require('cross-fetch');


const app = express();
app.use(express.json());
app.use(cors())

CLIENT_ID = "e59aac954fc940f79bd8f4b5fb78ad9a"
CLIENT_SECRET = "59bb8fc74ece445ab78d608efdd21016"
PORT = 5173
REDIRECT_URI = `http://localhost:5173/callback`
SCOPE = [
    "playlist-read-collaborative",
    "playlist-read-private",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-library-read"
]

let accessToken = null;
let verifier = null;
let songSet = new Set();
let songArrayFromSet = null;

app.use(express.static(__dirname + '/public'))
    .use(cors())

app.get("/", (request, response) => {
    response.send("Welcome to my application!"); // or redirect to another route if desired
});

//PKCE Authorization Code ========================================================================================================================

//Code verifier generation 
function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

//Generate code challenge
async function generateCodeChallenge(codeVerifier) {
    const sha256Digest = crypto.createHash('sha256').update(codeVerifier).digest();
    const base64Digest = Buffer.from(sha256Digest).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    return base64Digest;
}
//========================================================================================================================

app.get("/login", async (request, response) => {
    verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    const redirect_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${SCOPE}&state=123456&redirect_uri=${REDIRECT_URI}&prompt=consent&code_challenge_method=S256&code_challenge=${challenge}`
    response.redirect(redirect_url);

})

app.get("/callback", async (request, response) => {
    const code = request.query["code"]
    await axios.post(
        url = 'https://accounts.spotify.com/api/token',
        data = new URLSearchParams({
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
            'code': code,
            'code_verifier': verifier
        }),
        config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
                'grant_type': 'client_credentials'
            },
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET
            }
        })
        .then(resp1 => {
            setAccessToken(resp1.data.access_token);
            // console.log(resp1.data.access_token)
            return response.redirect("/");
        });
})

app.get("/logout", (request, response) => {
    // Clear the access token and any session data
    // console.log("about to click...")
    accessToken = null;
    response.redirect("/");
});

app.get("/data", (request, response) => {
    if (accessToken) {
        response.send(accessToken);
    } else {
        response.send("Access token not available. Please log in.");
    }
});

async function setAccessToken(access) {
    accessToken = access;
}
async function getAccessToken() {
    return accessToken;
}

app.post('/addLikedSongs', async (req, res) => {
    const { likedSongs } = req.body;
    const songListArr = [...likedSongs]; //Creating copy of array 

    try {
        for (song of songListArr) {
            songSet.add(song);
        }
        console.log("Liked songs added to set successfully.")
        //    songArrayFromSet = Array.from(songSet); // Converts song set to array when all is said and done 
        res.sendStatus(200); // Sending a success response
    } catch (error) {
        console.error('Error adding liked songs:', error);
        res.sendStatus(500); // Sending an error response
    }
});

app.post('/fetchAlbumList', async (req, res) => {
    const limit = 50;
    let offset = 0;
    let allAlbums = []; // array of album ids 

    console.log("Fetching album list...");
    try {
        let albums = null;
        do {
            const result = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            });
            const data = await result.json();
            await getTracksForEach(data); // Batch of tracks 
            albums = data.items.map(ob => ob.album.id);
            allAlbums = allAlbums.concat(albums);
            offset += limit;
        } while (albums.length > 0);
        console.log("All songs added to set.");
        res.sendStatus(200);
    } catch (error) {
        console.error("Error fetching albums:", error);
        throw error; // Rethrow the error to be caught at the higher level
    }
});

async function getTracksForEach(data) {
    try {
        console.log("In one batch.");
        let trackBatchTotalTracks = data.items.map(ob => ob.album).map(ob => ob.total_tracks); // Data is an array of 50 album infos. 
        let trackBatchSongUri = data.items.map(ob => ob.album).map(ob => ob.tracks).map(ob => ob.items).flat().map(track => track.uri) // array of albums
        for (let i = 0; i < trackBatchTotalTracks.length; i++) {
            if (trackBatchTotalTracks[i] >= 50) {
                // Pass ID to another function, handle with pagination  
                await handlePagination(data.items[i].album.id);
                console.log("pagination handled.")
            } else {
                // Add tracks directly to set 
                for (song of trackBatchSongUri) {
                    songSet.add(song);
                }
            }
        }
        console.log("All songs compiled.")
    } catch (error) {
        console.error("Error getting tracks for each.", error)
    }
}

async function handlePagination(albumId) {
    const limit = 50;
    let offset = 0;
    let trackList = [];

    console.log("Handling pagination...");
    let tracks = null;
    do {
        const result = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await result.json();
        tracks = data.items.map(ob => ob.uri);
        trackList = trackList.concat(tracks);
        offset += limit;
    } while (tracks.length > 0)

    for (song of trackList) {
        songSet.add(song);
    }
}

app.post('/addSongsToPlaylist', async (req, res) => {
    const { playlistid, profile_ } = req.body;
    // await batchSongs(); 
})

async function batchSongs() {
    const limit = 100;
    const offset = 0;
    // console.log("Length: " + songArrayFromSet.length);
    // return batch; 
}




console.log('Listening on 5173');
app.listen(5173);
