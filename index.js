require('dotenv').config(); 
const con = require('./db_connect.js');
const express = require("express");
const axios = require('axios');
const cors = require("cors");
const crypto = require('crypto');
const mysql = require('mysql2');
const app = express();

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
        console.log(accesToken);
    });

    app.get("/data", (request, response) => {
        if (accessToken) {
            response.send(accessToken);
        } else {
            response.send("Access token not available. Please log in.");
        }
    });

    function setAccessToken(access){
        accessToken = access; 
    }
    function getAccessToken(){
        return accessToken; 
    }

    // Get mysql route - returns con (sql pool) from db_connect 
    app.get('/connect', (req, res) => {
        const { config } = con;
        const connectionConfig = { ...config.connectionConfig }; // Copy the connection config object
        // Exclude circular references
        delete connectionConfig.pool;
        const responseObj = {
          host: config.host,
          user: config.user,
          database: config.database,
          connectionConfig,
        };
      
        console.log('Connected to the database');
        res.json(responseObj);
    });
    

console.log('Listening on 5173');
app.listen(5173);
