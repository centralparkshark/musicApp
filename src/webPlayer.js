export function makeMusicPlayer(token) {
    const togglePlayBtn = document.getElementById('togglePlay')
    let play = false;

    const player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });
    

    // Ready
    player.addListener('ready', async ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        const devices = await getAvailableDevices(token)
        const isDeviceAvailable = devices.some(device => device.id === device_id);
        
        if (isDeviceAvailable) {
            console.log('Device is available, transferring playback.');
            await transferPlayback(device_id, token);
        } else {
            console.error('Device is not listed as available, cannot transfer playback.');
        }
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });

    togglePlayBtn.onclick = function() {
      player.togglePlay();
      if (play == false) {
        togglePlayBtn.innerHTML = "<i class='fa fa-pause fa-2x'></i>"
        play = true;
      } else {
        togglePlayBtn.innerHTML = "<i class='fa fa-play fa-2x'></i>"
        play = false;
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
            console.log('Playback transferred to web device');
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
            console.log('Available devices:', data);
            return data.devices;
        } else {
            console.error('Error fetching devices:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error during fetch operation:', error);
    }
}
