export async function authUser() {
        
    // let redirectUri = 'https://music-app-gamma-eight.vercel.app/'
    let redirectUri = 'http://127.0.0.1:5500/index.html'
    let clientId = "1c838ac2f4f348c39ab500dd048c0d77"

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    console.log(code)
    
    if (code != null) {
        console.log("Authorization code found:", code);
        const accessToken = await getAccessToken(clientId, code);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("expiresAt", Date.now() + 3600 * 1000); // Assuming token expires in 1 hour
        // Redirect to remove code from URL
        window.history.replaceState({}, document.title, "/index.html");
        const profile = await fetchProfile(accessToken);
        return profile;
    } else {
        // If no code, try to load the profile if already authenticated
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            const expiresAt = localStorage.getItem("expiresAt");
            if (Date.now() > expiresAt) {
                console.log("Access token expired, refreshing...");
                const newToken = await refreshAccessToken();
                localStorage.setItem("accessToken", newToken);
                localStorage.setItem("expiresAt", Date.now() + 3600 * 1000);
                const profile = await fetchProfile(newToken);
                return profile;
            } else {
                const profile = await fetchProfile(accessToken);
                return profile;
            }
        } else {
            redirectToAuthCodeFlow(clientId)
        }
    }

    async function redirectToAuthCodeFlow(clientId) {
        // TODO: Redirect to Spotify authorization page
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem("verifier", verifier);

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("response_type", "code");
        params.append("redirect_uri", redirectUri);
        params.append("scope", "user-read-private user-read-email");
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
        // TODO: Get access token for code
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
        const { access_token, expires_in, refresh_token } = data;

        // Store access token, expiry time, and refresh token
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("expiresAt", Date.now() + expires_in * 1000);
        localStorage.setItem("refreshToken", refresh_token);

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


    async function fetchProfile(token) {
        const result = await fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        const profile = await result.json();
        return profile;
    }

    
}