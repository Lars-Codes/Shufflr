// let accessToken = null;

function populateUI() {
    fetch('http://localhost:5173/data') //Gets access token 
        .then(res => res.text())
        .then(data => {
            // accessToken = data; 
            fetchData(data)
        })
}

async function fetchProfile(token) { //Gets passed the access token 
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

function fetchData(token){
    fetchProfile(token)
    .then(profile => {
        document.getElementById("displayName").innerText = profile.display_name;
        if (profile.images[0]) {
            const profileImage = new Image(200, 200);
            profileImage.src = profile.images[0].url;
            document.getElementById("avatar").appendChild(profileImage);
            document.getElementById("imgUrl").innerText = profile.images[0].url;
        }
        document.getElementById("id").innerText = profile.id;
        document.getElementById("email").innerText = profile.email;
        document.getElementById("uri").innerText = profile.uri;
        document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
        document.getElementById("url").innerText = profile.href;
        document.getElementById("url").setAttribute("href", profile.href);
    })
    .catch("Error fetching profile");
}

populateUI(); 
