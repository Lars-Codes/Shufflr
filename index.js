require('dotenv').config();
const express = require("express");
const axios = require('axios');
const cors = require("cors");
const crypto = require('crypto');
const mongodb = require('mongodb');
const { client, dbName, connectToMongoDB } = require('./db_connect.js');
const { connect } = require('http2');

const app = express();
app.use(express.json());
app.use(cors())


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
    console.log("about to click...")
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

function setAccessToken(access) {
    accessToken = access;
}
function getAccessToken() {
    return accessToken;
}

//Creating new collection if not exists with the data value "id" = userId. 
// Doing it in an async function so code does not attempt to insert into DB before collection is created. 
async function createAndInsert(userId) {
    await client.connect();
    const db = client.db(dbName);
    try {
        await db.createCollection(userId);
        await db.collection(userId).insertOne({ id: userId });
    } catch (error) {
        console.error('Error creating an inserting', error);
    }
}

// Handle the creation of a new collection based on the userID
app.post('/create-collection', async (req, res) => {
    await client.connect();
    const db = client.db(dbName);
    // console.log(userId);
    try {
        const { userId } = req.body;
        if (userId) {
            const collectionName = userId;
            //check if collection exists 
            const collections = await client.db(dbName).listCollections().toArray();
            const collectionExists = collections.some((collection) => collection.name == collectionName);

            if (collectionExists) {
                console.log("User exists.");
            } else {
                // Create a new collection with the user's profile ID
                await createAndInsert(userId);
            }
            res.status(200).json({ message: 'Collection created successfully.' });
        }
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ error: 'An error occurred while creating the collection.' });
    } finally {
        // Close the MongoDB connection after creating the collection
        await client.close();
    }
});

//Check if user exists 
// app.post('/userExists'), async (req, res) => {
//     await client.connect();
//     const db = client.db(dbName);
//     try {
//         const { userId } = req.body;
//         if (userId) {
//             const collectionName = userId;
//             //check if collection exists 
//             const collections = await client.db(dbName).listCollections().toArray();
//             const collectionExists = collections.some((collection) => collection.name == collectionName);
//             if(collectionExists){
//                 return true; 
//             } else{
//                 return false; 
//             }
//         }
//     } catch(error){
//         console.error('Error searching for user', error)
//     }
// }

app.post('/addLikedSongs', async (req, res) => {
    await client.connect();
    const db = client.db(dbName);

    //Retrieving liked songs list and userID 
    const { likedSongs, userId } = req.body;
    const songListArr = [...likedSongs]; //Creating copy of array 

    try {
        //Checking to see if collection exists 
        const collections = await client.db(dbName).listCollections().toArray();
        const collectionExists = collections.some((collection) => collection.name == userId);
        //If the collection does not exist, create one with the userId. 
        if (!collectionExists) {
            createAndInsert(userId);
        }

        //Add liked songs 
        await db.collection(userId).updateOne({}, { $addToSet: { songs: { $each: songListArr } } });
        res.sendStatus(200); // Sending a success response
    } catch (error) {
        console.error('Error adding liked songs:', error);
        res.sendStatus(500); // Sending an error response
    }
});

//Adding album ID as key. Function below will fill in each album with a set of song URIs. 
// Note: NOT using the album URI. Using the album ID as the key. When retrieving album tracks, 
// Spotify API takes the album ID as a parameter, NOT the URI. 
app.post('/addAlbumAsKey', async (req, res) => {
    await client.connect();
    const db = client.db(dbName);
    //Retrieve album ID 
    const { albumIds, userId } = req.body;
    const albumList = [...albumIds]; //Creating copy of array 
    try {
        //Creates a JavaScript object of AlbumID: null 
        // so then it can insert each 
        const albumsObject = albumList.reduce((obj, album) => ({ ...obj, [album]: null }), {});
        await db.collection(userId).updateOne({}, { $set: albumsObject, $setOnInsert: { id: userId } }, { upsert: true });
        console.log("Success!...")

        res.sendStatus(200); // Sending a success response
    } catch (error) {
        console.error('Error adding album IDs:', error);
        res.sendStatus(500); // Sending an error response
    }
});


//Check to see if track is in LikedSongs. 
app.post('/addTracksToAlbum', async (req, res) => {
    await client.connect();
    const db = client.db(dbName);
    const {aid, tl, pid} = req.body; //retrieving album id, track list, profile id 
    //Checking to see if track is in "songs" list. 
    for(track of tl){
        const trackExistsCursor = await db.collection(pid).find({ songs: { $in: [track] } });
        const trackExistsArray = await trackExistsCursor.toArray();
        if (trackExistsArray.length > 0) {
            console.log(track); // Accessing the first and only element
          }
    //    if(trackExists){
    //     console.log(track);
    //    }
        // if(!trackExists){
        //     db.collection(pid).updateOne(
        //         {id: [pid]},
        //         {$addToSet: {[aid]: track}}
        //     )
        // } 
    }
}); 





//Adding songs to each album. NOTE: If the given song is already in the LIKED SONGS set, it 
// will NOT be added to the album list. This is done to prevent duplicates when porting songs to 
// playlist. 
// Why not have 1 giant set? When I eventually create the plugin to add/delete songs from playlist 
// upon liking/unliking, formatting it this way will make it easier to prevent duplicates. 
// app.post('addSongsToAlbumSet'), async (req, res) => {

// }

console.log('Listening on 5173');
app.listen(5173);
