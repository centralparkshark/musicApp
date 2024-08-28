import {authUser} from "./src/auth.js";
import { displaySongInfo } from "./src/songInfo.js";

const toggleModeBtn = document.getElementById("toggleMode");
const closePopUpBtn = document.getElementById("closePopUp");
const bodyEl = document.querySelector("body");
const cardHolderEl = document.getElementById("topTracks");
const topTracksTitle = document.getElementById("songRecsTitle");


// Toggle dark/light mode
function toggleMode() {
    bodyEl.classList.toggle("light");
    bodyEl.classList.toggle("dark");
}

function populateUI(obj) {
    try {
        topTracksTitle.innerText = "Your Top Songs:"
        console.log(obj)
        obj.items.forEach(track => {
        let artists = track.artists;
        let artistText = ''
        let length = artists.length - 1;
        for (let i = 0; i < length; i++) {
            artistText += `<a id="artists/${artists[i].id}">${artists[i].name}, </a>`
        } 
        artistText += `<a id="artists/${artists[length].id}">${artists[length].name}</a>`

        const newCard = document.createElement("div")
        newCard.classList.add("card")
        newCard.id= `tracks/${track.id}`;
        newCard.innerHTML = `<img src="${track.album.images[1].url}" alt="${track.album.name}" class="artistPic" id="albums/${track.album.id}">
                <div class="songName" id="tracks/${track.id}">${track.name}</div>
                <div class="artistName">${artistText}</div>`
        newCard.addEventListener('click', displaySongInfo)
        cardHolderEl.appendChild(newCard)
    });
    } catch (error) {
        token = authUser();
        let topTracks = fetchTracks(token)
        populateUI(topTracks) 

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
    document.getElementById("popUp").style.display = "none"
}

// Event Listeners
toggleModeBtn.addEventListener('click', toggleMode);
closePopUpBtn.addEventListener('click', closePopUp)

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


// requirements
// [x] use fetch API to populate app
// [ ] create user interaction with API (GET)
// [ ] user mnanipulation of DATA (POST, PUT, or PATCH)
// [ ] promises
// [x] async/await 
// [ ] 3 modules w/ import
// [ ] runs as expected
// [x] engaging experience
// [ ] runs without errors
// [ ] commit frequently 
// [ ] readme
// [x] level of effort