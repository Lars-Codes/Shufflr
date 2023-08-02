let token = null;
let profile = null;

// Retrieves access token 
async function fetchAccessToken() {
    try {
        const response = await fetch('http://localhost:5173/data');
        const data = await response.text();
        token = data;
        return data;
    }  //Gets access token. Need to include "return" so it can return a promise to be 
    catch (error) {
        throw new Error("Error fetching access token: " + error);
    }
}

//Modified fetchProfile code to save userID
async function fetchProfile() {
    try {
        const response = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        })
        const profile_ = await response.json();
        const userId = profile_.id;
        profile = profile_;
        return profile;
    } catch (error) {
        throw new Error("Error fetching profile: " + error);
    }
}

// Route to create playlist 
async function fetchPlaylistForCreation() {
    // Returns ID for playlist 
    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
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
        const data = await response.json();
        return data.id;
    } catch (error) {
        throw new Error("Error creating playlist: " + error);
    }
}

async function fetchAlbumList() {
    try {
        const userId = profile.id;
        const response = await fetch('/fetchAlbumList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("Hello?!?!?!")
        return 0; 
    } catch (error) {
        console.error("Error fetching album list", error);
    }
}

//Get all of user's liked songs and send to backend to add to DB 
async function fetchLikedSongs() {
    const limit = 50;
    let offset = 0;
    let allLiked = [];
    let songs = null;
    do {
        const result = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await result.json();
        songs = data.items.map(ob => ob.track).map(ob => ob.uri);
        allLiked = allLiked.concat(songs);
        offset += limit;

    } while (songs.length > 0);

    // After fetching them, add to JS object 
    let result = await fetch('/addLikedSongs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ likedSongs: allLiked}), // Sending the user ID in the request body
    })
    //Return list of liked songs 
    return allLiked;
}

async function addToPlaylist(playlistId) {
    try {
        console.log("Adding songs to playlist..")
        let addSongsToPlaylist = await fetch('http://localhost:5173/addSongsToPlaylist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playlistid: playlistId })
        });
    } catch (error) {
        console.error("Error reaching playlist route", error);
    }
}

async function createPlaylist() {
    try {
        await fetchAccessToken();
        await fetchProfile();
        // Populate UI 
        if (profile) {
            document.getElementById("displayName").innerText = profile.display_name;
            if (profile.images[0]) {
                const profileImage = new Image(200, 200);
                profileImage.src = profile.images[0].url;
                document.getElementById("avatar").appendChild(profileImage);
            }
            let playlistId = await fetchPlaylistForCreation(); // Creates playlist, returns playlistid 

            await fetchLikedSongs(); // Add liked songs to set 
            await fetchAlbumList(); // Get album list 
            await addToPlaylist(playlistId)
            console.log("Success adding to playlist!")

        }
    } catch (error) {
        console.error("Error in createPlaylist:", error);
    }
}
createPlaylist();



