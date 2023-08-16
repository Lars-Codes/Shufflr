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

async function displayProfile() {
    try {
        await fetchProfile();
        document.getElementById("displayName").innerText = "Log in with Spotify on the Home Page to continue.";
        // Populate UI 
        if (profile.images[0]) {
            const profileImage = new Image(200, 200);
            profileImage.src = profile.images[0].url;
            document.getElementById("displayName").innerText = "Logged in as " + profile.display_name;
        }
    } catch (error) {
        console.error("Error in createPlaylist:", error);
    }
}
displayProfile();

async function locatePlaylist(playlistName) {
    try {
        let result = await fetch('http://localhost:5173/findPlaylistsToShuffle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ toFind: playlistName }),
        });
        const response = await result.json();
        return response;
    } catch (error) {
        console.error("Error fetching route", error);
    }
}

async function shuffling(numSongs) {
    let result = await fetch('/getSizeOfPlaylist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num: numSongs })
    });
}


let exists = null;
let shuffle = document.getElementById("shuffle");
shuffle.addEventListener("click", shuffleSongs);
async function shuffleSongs() {
    const userInput = document.getElementById("userInput");
    let playlistName = userInput.value; // Name of playlist

    const numSongsInput = document.getElementById("numSongs");
    let numSongs = numSongsInput.value;
    if (numSongs < 0) {
        numSongs = Math.abs(numSongs);
    } else if (numSongs == 0) {
        numSongs = 1;
    }

    playlistName = playlistName.replace(/\s*$/, ''); // Remove trailing white spaces
    playlistName = playlistName.replace(/^\s+/, '');

    message(1);
    message(3);
    exists = await locatePlaylist(playlistName);
    message(2);
    if (exists == 0 || exists == null) {
        message(0);
        message(2); 
        message(7); 
        message(5);
    } else {
        message(1);
        message(4);
        await shuffling(numSongs);
        message(5);
        message(6); 

    }
}

function message(code) {
    switch (code) {
        case 0:
            document.getElementById("reload").innerText = "Ruh-roh! Looks like we can't find your playlist. Did you include the correct upper/lowercase letters?";
            break;
        case 1:
            const imageHTML = `<img src = "./images/toaster.gif">`;
            document.getElementById("loading").innerHTML = imageHTML;
            break;
        case 2:
            document.getElementById("loading").innerHTML = "";
            break;
        case 3:
            document.getElementById("processing").innerText = "Finding playlist..."
            break;
        case 4:
            document.getElementById("processing").innerText = "Randomizing items... This might take a moment...";
            break;
        case 5:
            const toast = `<img width = 200px src ="./images/toasted.gif">`
            document.getElementById("loading").innerHTML = toast;
            break;
        case 6:
            document.getElementById("processing").innerText = "Items added to queue!";
            break;
        case 7: 
            document.getElementById("processing").innerText = ""
            break;
    }
}