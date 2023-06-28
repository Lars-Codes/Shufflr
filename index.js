// const express = require('express'); 
// const app = express(); 
// const path = require('path');
// const myRoutes = require("./server/routes/myroutes"); //gives us access to all of our routes in myroutes

// app.use(express.json()); //To parse JSON bodies (Applicable for Express 4.16+)

// app.use(express.static(__dirname + "/public"));
// app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public', 'index.html')))

// //CORS middleware 
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); 
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
//     res.header("Access-Control-Allow-Headers", "GET, POST, PUT, DELETE, OPTIONS"); 
//     next(); 
// })

// app.use("/my-routes", myRoutes)

// const PORT = process.env.PORT || 5173; //A communication endpoint. Can be accessed 
// // through http://localhost:3000. 

// //Starts our server 
// app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));

// ================================================================================================================================================
// var express = require('express'); // Express web server framework
// var request = require('request'); // "Request" library
// var cors = require('cors');
// var querystring = require('querystring');
// var cookieParser = require('cookie-parser');

// var client_id = 'e59aac954fc940f79bd8f4b5fb78ad9a'; // Your client id
// var client_secret = '59bb8fc74ece445ab78d608efdd21016'; // Your secret
// var redirect_uri = 'http://localhost:5173/callback'; // Your redirect uri


// /**
//  * Generates a random string containing numbers and letters
//  * @param  {number} length The length of the string
//  * @return {string} The generated string
//  */
// var generateRandomString = function(length) {
//   var text = '';
//   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//   for (var i = 0; i < length; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return text;
// };
// var stateKey = 'spotify_auth_state';

// var app = express();

// app.use(express.static(__dirname + '/public'))
//    .use(cors())
//    .use(cookieParser());

// app.get('/login', function(req, res) {

//   var state = generateRandomString(16);
//   res.cookie(stateKey, state);

//   // your application requests authorization
//   var scope = 'user-read-private user-read-email';
//   res.redirect('https://accounts.spotify.com/authorize?' +
//     querystring.stringify({
//       response_type: 'code',
//       client_id: client_id,
//       scope: scope,
//       redirect_uri: redirect_uri,
//       state: state
//     }));
// });

// app.get('/callback', function(req, res) {
//   // your application requests refresh and access tokens
//   // after checking the state parameter

//   var code = req.query.code || null;
//   var state = req.query.state || null;
//   var storedState = req.cookies ? req.cookies[stateKey] : null;

//   if (state === null || state !== storedState) {
//     res.redirect('/#' +
//       querystring.stringify({
//         error: 'state_mismatch'
//       }));
//   } else {
//     res.clearCookie(stateKey);
//     var authOptions = {
//       url: 'https://accounts.spotify.com/api/token',
//       form: {
//         code: code,
//         redirect_uri: redirect_uri,
//         grant_type: 'authorization_code'
//       },
//       headers: {
//         'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//       },
//       json: true
//     };

//     request.post(authOptions, function(error, response, body) {
//       if (!error && response.statusCode === 200) {

//         var access_token = body.access_token,
//             refresh_token = body.refresh_token;

//         var options = {
//           url: 'https://api.spotify.com/v1/me',
//           headers: { 'Authorization': 'Bearer ' + access_token },
//           json: true
//         };

//         // use the access token to access the Spotify Web API
//         request.get(options, function(error, response, body) {
//           console.log(body);
//         });

//         // we can also pass the token to the browser to make requests from there
//         res.redirect('/#' +
//           querystring.stringify({
//             access_token: access_token,
//             refresh_token: refresh_token
//           }));
//       } else {
//         res.redirect('/#' +
//           querystring.stringify({
//             error: 'invalid_token'
//           }));
//       }
//     });
//   }
// });

// app.get('/refresh_token', function(req, res) {

//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// });

// console.log('Listening on 5173');
// app.listen(5173);
// ================================================================================================================================================

const express = require("express")
const axios = require('axios')
const cors = require("cors");

const app = express()
app.use(cors())
CLIENT_ID = "e59aac954fc940f79bd8f4b5fb78ad9a"
CLIENT_SECRET = "59bb8fc74ece445ab78d608efdd21016"
PORT = 5173 // it is located in Spotify dashboard's Redirect URIs, my port is 3000
REDIRECT_URI = `http://localhost:5173/callback` // my case is 'http://localhost:3000/callback'
SCOPE = [
    "user-read-email",
    "playlist-read-collaborative"
]

let accessToken = null;

app.use(express.static(__dirname + '/public'))
   .use(cors())
//    .use(cookieParser());
app.get("/", (request, response) => {
    response.send("Welcome to my application!"); // or redirect to another route if desired
  });

app.get("/login", (request, response) => {
    const redirect_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${SCOPE}&state=123456&redirect_uri=${REDIRECT_URI}&prompt=consent`
    response.redirect(redirect_url);
})

app.get("/callback", async (request, response) => {
    const code = request.query["code"]
    await axios.post(
        url = 'https://accounts.spotify.com/api/token',
        data = new URLSearchParams({
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
            'code': code
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
            console.log(resp1.data.access_token)
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

    if(!getAccessToken()){
        console.log("null!")
    } else{
        console.log("nice")
    }

console.log('Listening on 5173');
app.listen(5173);
