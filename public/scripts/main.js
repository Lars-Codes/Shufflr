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

async function createPlaylist() {
    try {
        await fetchProfile();
        // Populate UI 
        if (profile) {
            document.getElementById("displayName").innerText = profile.display_name;
            if (profile.images[0]) {
                const profileImage = new Image(200, 200);
                profileImage.src = profile.images[0].url;
                document.getElementById("avatar").appendChild(profileImage);
            }
            await fetchLikedSongs(); // Add liked songs to set 
            await fetchAlbumList(); // Get album list 
            await addToPlaylist() // Adds songs to playlist using playlist ID. 
            console.log("Success adding to playlist!")
        }
    } catch (error) {
        console.error("Error in createPlaylist:", error);
    }
}
createPlaylist();



