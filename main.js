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
}


// Event Listeners
toggleModeBtn.addEventListener('click', toggleMode);

document.addEventListener('DOMContentLoaded', async () => {
    const profile = await authUser();
    if (profile) {
        populateUI(profile);
    }
});