// Retrieves access token 
function fetchAccessToken() {
    return fetch('http://localhost:5173/data') //Gets access token. Need to include "return" so it can return a promise to be 
        .then(res => res.text()) //chained inside a then function
        .then(data => {
            return data;
        })
        .catch("Error fetching profile.");
}

//Modified fetchProfile code to save userID
async function fetchProfile(token) {
    try {
        const profile = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json());

        const userId = profile.id;
        // Sending user ID to the backend - to create collection 
        await fetch('/create-collection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }), // Sending the user ID in the request body
        });

        // await fetch('/addLikedSongs', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ userId }), // Sending the 'allLiked' data in the request body
        //   });

        return profile;
    } catch (error) {
        throw new Error("Error fetching profile: " + error);
    }
}


// Route to create playlist 
function fetchPlaylistForCreation(profile, token) {
    return fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: 'All Songs Playlist',
            description: 'Includes all liked songs, albums, & playlists created by you. App by @artbylarapalombi on Instagram.'
        })
    })
        .then(res => res.json())
        .then(data => data.id)
        .catch(error => {
            throw new Error("Error creating playlist: " + error);
        });
}

// Gets list of albums that user has and returns a list of album ids. 
async function fetchAlbumList(token) {
    const limit = 50;
    let offset = 0;
    let allAlbums = [];

    var result = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    let data = await result.json();
    let albums = data.items.map(ob => ob.album.id);
    while (albums.length > 0) {
        allAlbums = allAlbums.concat(albums); //Concatenating 50 or less albums to album list 
        offset += limit; //start point for next set of 50 or less albums 

        result = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        data = await result.json();
        albums = data.items.map(ob => ob.album.id);
    }

    fetchData(token)
        .then((profile) => {
            return profile.id;
        })
        .then((id) => {
            return fetch('/addAlbumAsKey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ albumIds: allAlbums, userId: id  }), // Sending the user ID in the request body 
            })
        })

    return allAlbums; //returns a list of IDs 
}

//Parameter is the list of albums. For each album, retrieve the list of tracks
async function getAlbumTracks(albumList){
    //Must do 50 at a time. 
    // Send album ID, track list 
}



//Get all of user's liked songs and send to backend to add to DB 
async function fetchLikedSongs(token) {
    const limit = 50;
    let offset = 0;
    let allLiked = [];

    var result = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    let data = await result.json();
    let songs = data.items.map(ob => ob.track).map(ob => ob.uri)
    while (songs.length > 0) {
        allLiked = allLiked.concat(songs);
        offset += limit;

        result = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        data = await result.json();
        songs = data.items.map(ob => ob.track).map(ob => ob.uri)
    }

    fetchData(token)
        .then((profile) => {
        return profile.id;
    })
        .then((id) => {
            return fetch('/addLikedSongs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ likedSongs: allLiked, userId: id }), // Sending the user ID in the request body
            })
        })
    //Return list of liked songs 
    return allLiked;
}

// Route to add to playlist based on the playlistId created in this code. 
// Need to modify so it doesn't get a parameter but draws directly from the database in chunks. 
async function requestAddToPlaylist(token, playlistId, listUri) {
    //The variable listUri may have more than 100 items. This is getting passed a list of songs from list of albums. Another 
    // function will be used to add specifically liked songs/playlists created. 
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "uris": [listUri] //Max of 100 items per request 
        }),
        "position": 0
    });

}

// Explicit error handling if there is an error fetching profile 
function fetchData(token) {
    return fetchProfile(token)
        .catch(error => { throw new Error("Error fetching profile: " + error); })
}


//Populate user interface with profile picture and profile name 
function populateUI() {
    fetchAccessToken()
        .then((token) => {
            return fetchData(token); //make sure to type return! 
        })
        .then(profile => {
            document.getElementById("displayName").innerText = profile.display_name;
            if (profile.images[0]) {
                const profileImage = new Image(200, 200);
                profileImage.src = profile.images[0].url;
                document.getElementById("avatar").appendChild(profileImage);
            }
        })
}

//NEED ID OF ALBUM, NOT URI 
// async function addAlbumTracksToDb(id, token) { //first test with just 1 uri / adding to database 
//     //gonna fetch a list of tracks from the one album and add to DB 
//     var limit = 50;
//     const result = await fetch(`https://api.spotify.com/v1/albums/${id}/tracks?limit=${limit}`, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//         },
//     });
//     data = await result.json();
//     const songs = data.items.map(item => item.uri); //Get list of uris of a single album
//     addSongsToDB(songs);
//     return songs;
// }

// Retrieves list of album uris and stores in variable.
// async function addSavedAlbums() {
//     var albumIds = null;
//     var playlist_id = null;
//     // if (!accessToken) {
//     fetchAccessToken()
//         .then((token) => {
//             return fetchData(token);
//         })
//         .then(profile => {
//             albumIds = fetchAlbumList(token, profile) //returns a list of URIs 
//             return albumIds;
//         })
    // .then(() => {
    //     playlist_id = createPlaylist(); 
    //     return playlist_id; 
    // })

    //Now have a list of album uris. Need a list of tracks based on the album uris. Add to database.
    // You need a list of playlists you created (Including liked songs) Need a list of tracks based on playlist uris. Add to database. 
    // Now, combine all of the arrays into 1 array -- one long array of every single song. 
    // Then create a new playlist. Save the playlist id into a global variable and then: 
    // From there, pass this array into requestAddToPlaylist using playlist id. 

    //Put all the songs in a database 

    // You need to write code inside requestAddToPlaylist so it only adds 100 songs at a time.  Can do this with index/offset and a loop. 

    // Now you have your all songs playlist. Now you need to write code to remove duplicates that you may 
    // have encountered. 

    //From here, set a separate mechanism up so that from now on, every time you add a song/album, 
    // it automatically adds it to your AllSongs playlist. Every time you unlike a song/album, it removes from 
    // your AllSongs playlist. 

    //Make a back/frontend/ 
    // }
// }

// Retrieves access token and creates new all-songs playlist. Not sure if I quite need this yet. 
async function createPlaylist() {
    fetchAccessToken()
        .then((token) => {
            return fetchData(token);
        })
        .then(profile => {
            return fetchPlaylistForCreation(profile, token);
        })
}


//Make sure: 
// First access token, THEN liked songs add, THEN albums add

fetchAccessToken()
    .then((token) => {
        return fetchLikedSongs(token);
    })
    .then(() => {
        return fetchAccessToken();
    })
    .then((token) => {
        return fetchAlbumList(token);
    })

populateUI();
// fetchAlbumList(accessToken);

    // .then(() => {
    //     return addAlbumTracksToDb("4Zf9s5cZnvprrmMF0Dnl5l", accessToken)
    // })

    // .then(list => {
    //     for (const track of list)
    //         console.log(track);
    // })

// addSavedAlbums()
//     .then(list => {
//         console.log(list); 
//     })

//Need a list of URIs for the albums 

// createPlaylist()
//     .then(uri => {
//         console.log(uri);
//     })
// populateUI(); 
