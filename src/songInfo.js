import { playSong } from "./webPlayer.js";

const popUp = document.getElementById("popUp")

export async function displaySongInfo(e) {
    let token = localStorage.getItem("accessToken");
    let linkExt = e.target.id
    let fullLink = "https://api.spotify.com/v1/tracks/" + linkExt

    const result = await fetch(fullLink, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    makePopUp(await result.json(), token)   
}

async function makePopUp(track, token) {
    // info contains track info

    // use info to fetch album info
    const album = await fetch("https://api.spotify.com/v1/albums/" + track.album.id, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    const albumInfo = await album.json()

    // left side information
    let duration = 0;
    let tableData = ''
    let tracks = await albumInfo.tracks.items;
    tracks.forEach(song => {
        duration += song.duration_ms
        let songTimeFormated = calculateTime(song.duration_ms)
        if (songTimeFormated[2] < 10) {songTimeFormated[2] = `0${songTimeFormated[2]}`}
        tableData += `<tr uri=${song.uri} token=${token}>
                    <td uri=${song.uri} token=${token}>${song.track_number}</td>
                    <td uri=${song.uri} token=${token}>${song.name}</td>
                    <td uri=${song.uri} token=${token}>${songTimeFormated[1]}:${songTimeFormated[2]}</td>
                    </tr>`
    });
    let time = calculateTime(duration)
    let numSongs; 
    if (track.album.total_tracks > 1) {
        numSongs = `${track.album.total_tracks} songs`
    } else {
        numSongs = `1 song`
    }
    let albumLength;
    if (time[0] > 0) {
        albumLength = `${time[0]} hr ${time[1]} min`
    } else {
        albumLength = `${time[1]} min`
    }

    // right side information
    const artist = await fetch("https://api.spotify.com/v1/artists/" + albumInfo.artists[0].id, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    let artistInfo = await artist.json()
    let genres = getGenres(artistInfo.genres)
    let artists = await getArtists(track.artists, token)
    
    
    const trackInfo = document.getElementById("trackInfo")
    trackInfo.innerHTML = `<div class="albumName">${track.album.name}</div>
                            <div class="top">${track.artists[0].name} ∘ ${track.album.release_date.substring(0,4)} ∘ ${numSongs} ∘ ${albumLength}</div>
                            <table class="songs">${tableData}</table>`
    trackInfo.addEventListener('click', playSong)
    const artistInfoEl = document.getElementById("artistInfo")
    artistInfoEl.innerHTML = `<img src="${albumInfo.images[0].url}" class="albumCover">
                                <div class="genreTags">${genres}</div>
                                <div class="artists">${artists}</div>`
    popUp.style.display = "flex"
}

function calculateTime(ms) {
    let time = ms / 1000;
    const hours = Math.floor(time/3600)
    time = time - hours * 3600;
    const minutes = Math.floor(time/60)
    const seconds = Math.trunc(time - minutes * 60);
    return [hours,minutes,seconds]
}

function getGenres(genreString) {
    let genreEl = "";
    if (genreString[0]) {
        let genreArray = genreString[0].split(" ");
        genreArray.forEach(element => {
            genreEl += `<div class="genre">${element[0].toUpperCase()+element.slice(1)}</div>`
        });
    }
    return genreEl;
}

async function getArtists(artistArray) {
    let artistsEl = ""
    artistArray.forEach(element => {
        artistsEl += `<div class="artist">
                            <img src="./imgs/sabrinaCarpenter.jpg">
                            <div class="artistName">${element.name}</div>
                        </div>`
                          
    });
    return artistsEl;
    
}



// TO-DO
// - prolly should put things into their own functions but lazy
// - fix artist photo
// - fix multi artists