let play = false;

export function makeMusicPlayer(token) {
    const togglePlayBtn = document.getElementById('togglePlay')
    let playerReady = false;

    const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });
    

    // Ready
    player.addListener('ready', async ({ device_id }) => {
        playerReady = true;
        const devices = await getAvailableDevices(token)
        const isDeviceAvailable = devices.some(device => device.id === device_id);
        
        if (isDeviceAvailable) {
            await transferPlayback(device_id, token);
        } else {
            console.error('Device is not listed as available, cannot transfer playback.');
        }
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        playerReady = false;
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('player_state_changed', async state => {
        if (state) {
            const track = state.track_window.current_track;
            const artists = track.artists.map(artist => artist.name).join(', ');
            document.getElementById("songPlaying").innerText = `${track.name} ∘ ${artists}`;
        }
    });

    togglePlayBtn.onclick = async function() {
        if (playerReady) {
            await player.togglePlay();
            play = !play;
            togglePlayBtn.innerHTML = play ? "<i class='fa fa-pause fa-2x'></i>" : "<i class='fa fa-play fa-2x'></i>";
        }
        
      };

    player.connect();
}

async function transferPlayback(deviceId, token) {
    const url = `https://api.spotify.com/v1/me/player`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                device_ids: [deviceId],  
                play: false
            })
        });

        if (response.ok) {
            console.log('Playback successfully transferred.');
        } else {
            // Check if the response has content before parsing
            let errorData = null;
            if (response.headers.get('content-length') !== '0') {
                errorData = await response.json();
            }
            console.error('Error transferring playback:', response.status, response.statusText, errorData || 'No response body');
        }
    } catch (error) {
        console.error('Error during fetch operation:', error);
    }
}

async function getAvailableDevices(token) {
    const url = `https://api.spotify.com/v1/me/player/devices`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.devices;
        } else {
            console.error('Error fetching devices:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error during fetch operation:', error);
    }
}

export async function setSongInfo(token) {
    const url = `https://api.spotify.com/v1/me/player/currently-playing`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.item) {
                const songName = data.item.name;
                const artists = data.item.artists.map(artist => artist.name).join(', ');
                document.getElementById("songPlaying").innerText = `${songName} ∘ ${artists}`
            } else {
                document.getElementById("songPlaying").innerText = "No song currently playing";
            }
        } else {
            console.error('Error fetching song info:', response.status, response.statusText);        }
    } catch (error) {
        console.error('Error during fetch operation:', error);
    }
}

export async function playSong(e) {
    let token = e.target.getAttribute("token")
    const url = "https://api.spotify.com/v1/me/player/play"
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'uris': [e.target.getAttribute("uri")],
            "position_ms": 0
        })
    })
    setSongInfo(token)
    const togglePlayBtn = document.getElementById('togglePlay')
    togglePlayBtn.innerHTML = "<i class='fa fa-pause fa-2x'></i>"
    play = true;
    


    return response;
}


// To-Do: 
// - fix what to do if queue is empty