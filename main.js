import {authUser} from "./src/auth.js";
import { displaySongInfo } from "./src/songInfo.js";
import { makeMusicPlayer } from "./src/webPlayer.js";

const toggleModeBtn = document.getElementById("toggleMode");
const closePopUpBtn = document.getElementById("closePopUp");
const bodyEl = document.querySelector("body");
const cardHolderEl = document.getElementById("topTracks");
const popUp = document.getElementById("popUp");


// Toggle dark/light mode
function toggleMode() {
    if (bodyEl) {
        bodyEl.classList.toggle("light");
        bodyEl.classList.toggle("dark");
    }
}

async function populateUI(obj) {
    try {
        obj.items.forEach(track => {
            let artists = track.artists;
            let artistText = ''
            let length = artists.length - 1;
            for (let i = 0; i < length; i++) {
                artistText += `<a id="${track.id}">${artists[i].name}, </a>`
            } 
            artistText += `<a id="${track.id}">${artists[length].name}</a>`

            const newCard = document.createElement("div")
            newCard.classList.add("card")
            newCard.id= `${track.id}`;
            newCard.innerHTML = `<img src="${track.album.images[1].url}" alt="${track.album.name}" class="artistPic" id="${track.id}">
                    <div class="songName" id="${track.id}">${track.name}</div>
                    <div class="artistName">${artistText}</div>`
            newCard.addEventListener('click', displaySongInfo)
            if (cardHolderEl) cardHolderEl.appendChild(newCard);
        });
    } catch (error) {
        console.error("Error populating UI:", error);
        const token = await authUser();
        if (token) {
            const topTracks = await fetchTracks(token)
            populateUI(topTracks) 
        } else {
            console.error("Failed to authenticate user")
        }
        

    }
}

window.onSpotifyWebPlaybackSDKReady = () => {
    if(token) {
        makeMusicPlayer(token)
    } else {
        setTimeout(makeMusicPlayer(token), 2000)
    }
}


async function fetchTracks(token) {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();

}

function closePopUp() {
    if (popUp) popUp.style.display = "none"
}

// Event Listeners
if (toggleModeBtn) toggleModeBtn.addEventListener('click', toggleMode);
if (closePopUpBtn) closePopUpBtn.addEventListener('click', closePopUp)

let token = localStorage.getItem("accessToken");

if (token) {
    let topTracks = await fetchTracks(token)
    populateUI(topTracks)  
} else {
    token = await authUser();
    let topTracks = await fetchTracks(token)
    populateUI(topTracks) 
}

// TO-DO: 
// - fix login 
// - click -> pop up
    // - view basic information
    // - get recs
// - player? 
    // add to queue, play now
// - fix favicon


// requirements
// [x] use fetch API to populate app
// [x] create user interaction with API (GET)
// [ ] user manipulation of DATA (POST, PUT, or PATCH)
// [x] promises
// [x] async/await 
// [x] 3 modules w/ import
// [ ] runs as expected
// [x] engaging experience
// [ ] runs without errors
// [ ] commit frequently 
// [ ] readme
// [x] level of effort