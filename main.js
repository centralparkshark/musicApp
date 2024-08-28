import {authUser} from "./src/auth.js";

const toggleModeBtn = document.getElementById("toggleMode");
const loginBtn = document.getElementById("authUser");
const bodyEl = document.querySelector("body");

// Toggle dark/light mode
function toggleMode() {
    bodyEl.classList.toggle("light");
    bodyEl.classList.toggle("dark");
}

function populateUI(profile) {
    // TODO: Update UI with profile data
    console.log(profile)
    // document.getElementById("displayName").innerText = profile.display_name;
    // if (profile.images[0]) {
    //     const profileImage = new Image(200, 200);
    //     profileImage.src = profile.images[0].url;
    //     document.getElementById("avatar").appendChild(profileImage);
    //     document.getElementById("imgUrl").innerText = profile.images[0].url;
    // }
    // document.getElementById("id").innerText = profile.id;
    // document.getElementById("email").innerText = profile.email;
    // document.getElementById("uri").innerText = profile.uri;
    // document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    // document.getElementById("url").innerText = profile.href;
    // document.getElementById("url").setAttribute("href", profile.href);
}

async function fetchProfile(token) {
    console.log("fetching profile")
    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}



// Event Listeners
toggleModeBtn.addEventListener('click', toggleMode);

document.addEventListener('DOMContentLoaded', async () => {
    const token = await authUser();
    if (token) {
        const profile = await fetchProfile(token)
        populateUI(profile)
    }
});