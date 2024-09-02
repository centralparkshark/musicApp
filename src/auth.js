// most of this comes directly from spotify oauth how-to page
export async function authUser() {
    //let redirectUri = 'https://music-app-gamma-eight.vercel.app/'
    let redirectUri = 'http://127.0.0.1:5500/index.html'
    let clientId = "1c838ac2f4f348c39ab500dd048c0d77"

    // Check if access token exists and is valid
    let accessToken = localStorage.getItem("accessToken");
    const expiresAt = localStorage.getItem("expiresAt");

    // checks if not expired
    if (accessToken && Date.now() < expiresAt) {
        return Promise.resolve(accessToken);
    }

    // If token exists but expired, refresh it
    if (accessToken && Date.now() >= expiresAt) {
        accessToken = await refreshAccessToken();
        if (accessToken) {
            return accessToken;
        }
    }

    // checks if the url contains code
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    
    if (code) {
        // exchange code for access token
        accessToken = await getAccessToken(clientId, code);
        if (accessToken) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("expiresAt", Date.now() + 3600 * 1000); // Assuming token expires in 1 hour
            // Redirect to remove code from URL
            window.history.replaceState({}, document.title, "");
            return accessToken;
        }
        
    } else {
        await redirectToAuthCodeFlow(clientId, redirectUri);
    }

    async function redirectToAuthCodeFlow(clientId) {
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem("verifier", verifier);

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("response_type", "code");
        params.append("redirect_uri", redirectUri);
        params.append("scope", "user-read-private user-read-email user-top-read streaming user-read-playback-state user-modify-playback-state user-read-currently-playing");
        params.append("code_challenge_method", "S256");
        params.append("code_challenge", challenge);

        document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    function generateCodeVerifier(length) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    async function generateCodeChallenge(codeVerifier) {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    async function getAccessToken(clientId, code) {
        const verifier = localStorage.getItem("verifier");

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUri);
        params.append("code_verifier", verifier);

        const result = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

       

        const data = await result.json();
        if (!result.ok) { // Check if the request was successful
            console.error("Failed to get access token:", result.statusText);
            return null;
        }

        const { access_token, expires_in, refresh_token } = data;

        if (!access_token) { // Check if access token is present
            console.error("Access token is undefined");
            return null;
        }

        // Store access token, expiry time, and refresh token
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("expiresAt", Date.now() + expires_in * 1000);
        localStorage.setItem("refreshToken", refresh_token);
        // Redirect to remove code from URL
        // window.history.replaceState({}, document.title, "");

        return access_token;
    }

    async function refreshAccessToken() {
        const refreshToken = localStorage.getItem("refreshToken");

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refreshToken);

        const result = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        const data = await result.json();
        const { access_token, expires_in } = data;

        // Update access token and expiry time
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("expiresAt", Date.now() + expires_in * 1000);

        return access_token;
    }
}