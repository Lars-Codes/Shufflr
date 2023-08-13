let profile = null;

async function fetchProfile() {
    try {
        const result = await fetch('/fetchProfile');
        const profile_ = await result.json();
        profile = profile_;
        return profile;
    } catch (error) {
        throw new Error("Error fetching profile: " + error);
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
        return 0;
    } catch (error) {
        console.error("Error fetching album list", error);
    }
}

async function fetchLikedSongs() {
    let result = await fetch('/addLikedSongs');
}

async function addToPlaylist() {
    try {
        console.log("Adding songs to playlist..")
        let addSongsToPlaylist = await fetch('http://localhost:5173/addSongsToPlaylist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profileid: profile.id })
        });
    } catch (error) {
        console.error("Error reaching playlist route", error);
    }
}

// For updatePlaylist option 
async function fetchPlaylists() {
    try {
        console.log("Retrieving playlists...");
        let result = await fetch('/fetchPlaylists');
        const response = await result.json();
        return response;
    } catch (error) {
        console.error("Error fetching playlists", error);
    }
}

async function removePlaylist() {
    try {
        console.log("Updating playlist...");
        let result = await fetch('/removePlaylist');
    } catch (error) {
        console.error("Error fetching songs in all_songs", error);
    }
}

async function displayProfile() {
    try {
        await fetchProfile();
        document.getElementById("displayName").innerText = "Log in with Spotify on the Home Page to continue.";
        // Populate UI 
        if (profile.images[0]) {
            const profileImage = new Image(200, 200);
            profileImage.src = profile.images[0].url;
            // document.getElementById("avatar").appendChild(profileImage);
            document.getElementById("displayName").innerText = "Logged in as " + profile.display_name;
        } else {
            document.getElementById("displayName").innerText = "access token expired. Please log out and log back in.";

        }

        console.log("Success adding to playlist!")
    } catch (error) {
        console.error("Error in createPlaylist:", error);
    }
}
displayProfile();

let createActivated = false;
let updateActivated = false;
// TO CREATE PLAYLIST 
let createPlaylist = document.getElementById("playlist");
createPlaylist.addEventListener("click", create);

async function create() {
    message(12);
    message(14)
    if (!updateActivated && !createActivated) {
        message(10);
        message(7);
        createActivated = true;
        let exists = await fetchPlaylists();
        if (exists != 0) {
            message(0);
            message(11)
            message(13);
            createActivated = false;
        } else {
            message(2);
            await fetchLikedSongs(); // Add liked songs to set 
            message(3);
            await fetchAlbumList(); // Get album list 
            message(4);
            await addToPlaylist() // Adds songs to playlist using playlist ID.
            message(6);
            message(11)
            message(13);
        }
        createActivated = false;
    } else {
        message(1);
        message(13);
    }
}

// TO UPDATE PLAYLIST 
let updatePlaylist = document.getElementById("updateplaylist");
updatePlaylist.addEventListener("click", findPlaylist);

async function findPlaylist() {
    message(12);
    message(14)
    if (!updateActivated && !createActivated) {
        message(10);
        message(8);
        let exists = await fetchPlaylists();
        if (exists == 0) {
            message(9);
            message(11)
            message(13);
        } else {
            await update();
        }
    } else {
        message(1);
        message(13);
    }
    console.log("findPlaylist");
}

async function update() {
    if (!updateActivated && !createActivated) {
        updateActivated = true;
        await removePlaylist();
        updateActivated = false;
        await create();
    } else {
    }
}

let shuffle = document.getElementById("shuffle");
// shuffle.addEventListener("click", shuffleSongs);
shuffle.addEventListener("click", function(){
    console.log("test");
});
async function shuffleSongs() {
    // let exists = await fetchPlaylists();
    console.log("exists");
    // if (exists == 0) {
    //     message(9);
    //     console.log("test")
    // } else {
    //     message(9);
    //     console.log("test")
        // Get size of playlist, find random number in that range 
        // access API to shuffle 
        // add refresh token 
    // }
}


function message(code) {
    switch (code) {
        case 0:
            document.getElementById("status").innerText = "Oops! Looks like you already have an All Songs playlist! Please click the the Update Playlist button to proceed.";
            break;
        case 1:
            document.getElementById("status").innerText = "Have some patience, my dear -- no need to spam! Geez Louise!! I'm loadin, workin on it...";
            break;
        case 2:
            document.getElementById("status").innerText = "Yassss queen! OR KING! or Quing? Anyway I'm adding ur liked songs now!";
            break;
        case 3:
            document.getElementById("status").innerText = "Damn u rlly be listening to music. I'm adding ur albums now.";
            break;
        case 4:
            document.getElementById("status").innerText = "Okie doke. Gimme a moment I gotta add them to ur playlist now.";
            break;
        case 5:
            document.getElementById("status").innerText = "Coming back for more, eh? Fantabulous! I'll HAPPILY update ur playlist!!!!!";
            break;
        case 6:
            document.getElementById("status").innerText = "YOUR PLAYLIST HAS BEEN CREATED!!!!!!! OMG!";
            break;
        case 7:
            document.getElementById("status").innerText = "You want a playlist? WHATS THE MAGIC WORD? Just kidding im on it actually.";
            break; 
        case 8:
            document.getElementById("status").innerText = "Yasss I'll update ur playlist for u!!!!! Lemme look for it real quick...";
            break;
        case 9:
            document.getElementById("status").innerText = "Whoops, looks like we can't find your All Songs playlist! Maybe you changed the name or deleted it? In any case, please create a new playlist to proceed.";
            break;
        case 10:
            const imageHTML = `<img src = "./images/toaster.gif">`;
            document.getElementById("loading").innerHTML = imageHTML;
            break;
        case 11:
            const toast = `<img width = 200px src ="./images/toasted.gif">`
            document.getElementById("loading").innerHTML = toast;
            break;
        case 12:
            document.getElementById("reload").innerText = "Playlist in transit. Please do not reload this page. Doing so may result in an incomplete playlist. If this happens, please click the Update Preexisting Playlist button."
            break;
        case 13:
            document.getElementById("reload").innerText = "";
            break;
        case 14:
            document.getElementById("processing").innerHTML = "<iframe src=\"https://openprocessing.org/sketch/1913964/embed/\" width=\"500\" height=\"500\"></iframe>"
            break;
    }

}



