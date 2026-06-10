// Real-time Discord & Spotify activity via Lanyard API (REST polling)
// https://github.com/Phineas/lanyard

const DISCORD_USER_ID = "1398651277919129674";
const LANYARD_API = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;

// ─── Recently played tracking ───
const RECENTLY_PLAYED_KEY = "spotify_recently_played";
const MAX_RECENT = 5;
const RECENT_API = '/api/spotify/recent';

// ─── Load from server JSON file first, fallback to localStorage ───
async function loadRecentlyPlayedFromServer() {
    try {
        const res = await fetch(RECENT_API);
        if (res.ok) {
            const tracks = await res.json();
            // Sync localStorage with server data
            localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(tracks));
            return tracks;
        }
    } catch (err) {
        console.warn('Failed to load recently played from server:', err.message);
    }
    // Fallback to localStorage
    return getRecentlyPlayedFromLocal();
}

async function clearRecentlyPlayedOnServer() {
    try {
        await fetch(RECENT_API, { method: 'DELETE' });
    } catch (err) {
        console.warn('Failed to clear recently played on server:', err.message);
    }
}

function getRecentlyPlayedFromLocal() {
    try {
        const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function getRecentlyPlayed() {
    return getRecentlyPlayedFromLocal();
}

function saveRecentlyPlayed(tracks) {
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(tracks));
}

function getTrackKey(song, artist) {
    return (song + " - " + artist).toLowerCase().trim();
}

let lastTrackKey = null;

async function trackSpotifyHistory(spotify) {
    if (!spotify || !spotify.song || !spotify.artist) return;

    const key = getTrackKey(spotify.song, spotify.artist);

    // If same song is still playing, do nothing
    if (key === lastTrackKey) return;

    // Update last known track
    lastTrackKey = key;

    // Send to server (this is the primary storage now)
    try {
        await fetch(RECENT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                song: spotify.song,
                artist: spotify.artist,
                album: spotify.album || "",
                albumArt: spotify.album_art_url || ""
            })
        });
        // Reload from server to keep in sync
        const tracks = await loadRecentlyPlayedFromServer();
        if (window.renderRecentSpotify) {
            window.renderRecentSpotify();
        }
        return;
    } catch (err) {
        console.warn('Failed to sync track to server, falling back to localStorage:', err.message);
    }

    // Fallback: save locally
    const now = new Date();
    const entry = {
        song: spotify.song,
        artist: spotify.artist,
        album: spotify.album || "",
        albumArt: spotify.album_art_url || "",
        playedAt: now.toISOString(),
        timestamp: now.getTime()
    };

    const recent = getRecentlyPlayed();
    const filtered = recent.filter(t => getTrackKey(t.song, t.artist) !== key);
    filtered.unshift(entry);
    const trimmed = filtered.slice(0, MAX_RECENT);
    saveRecentlyPlayed(trimmed);
}

function getStatusEmoji(status) {
    switch (status) {
        case "online": return "🟢";
        case "idle": return "🌙";
        case "dnd": return "⛔";
        case "offline": return "⚫";
        default: return "🟢";
    }
}

function getStatusColor(status) {
    switch (status) {
        case "online": return "#23a55a";
        case "idle": return "#f0b232";
        case "dnd": return "#f23f43";
        case "offline": return "#80848e";
        default: return "#23a55a";
    }
}

function getStatusText(status) {
    switch (status) {
        case "online": return "online";
        case "idle": return "idle";
        case "dnd": return "do not disturb";
        case "offline": return "offline";
        default: return "online";
    }
}

function updateDiscordUI(data) {
    const statusSpan = document.getElementById("discordStatusText");
    const gameSpan = document.getElementById("discordGame");
    const userSpan = document.getElementById("discordUser");
    const statusDot = document.querySelector(".status-dot");

    if (!data) {
        if (statusSpan) statusSpan.innerText = "⚫ offline";
        if (gameSpan) gameSpan.innerText = "\u2014";
        if (statusDot) statusDot.style.backgroundColor = "#80848e";
        return;
    }

    const discordStatus = data.discord_status || "offline";
    const statusEmoji = getStatusEmoji(discordStatus);
    const statusText = getStatusText(discordStatus);

    // Update status dot
    if (statusDot) {
        statusDot.style.backgroundColor = getStatusColor(discordStatus);
    }

    // Update status text
    if (statusSpan) {
        statusSpan.innerText = statusEmoji + " " + statusText;
    }

    // Update activity / game
    if (data.activities && data.activities.length > 0) {
        const games = data.activities.filter(a => a.type !== 4);
        if (games.length > 0) {
            if (gameSpan) gameSpan.innerText = games[0].name || "\u2014";
        } else {
            const customStatus = data.activities.find(a => a.type === 4);
            if (customStatus && customStatus.state) {
                if (gameSpan) gameSpan.innerText = customStatus.state;
            } else {
                if (gameSpan) gameSpan.innerText = "\u2014";
            }
        }
    } else {
        if (gameSpan) gameSpan.innerText = "\u2014";
    }

    // Update username
    if (userSpan && data.discord_user) {
        const name = data.discord_user.global_name || data.discord_user.username;
        userSpan.innerText = name;
    }
}

function updateSpotifyUI(spotify) {
    const trackEl = document.getElementById("spotifyTrack");
    const artistEl = document.getElementById("spotifyArtist");
    const statusMsg = document.getElementById("spotifyStatusMessage");

    if (!spotify) {
        if (trackEl) trackEl.innerText = "not listening";
        if (artistEl) artistEl.innerText = "\u2014";
        if (statusMsg) statusMsg.innerHTML = "\ud83d\udca4 nothing playing";
        return;
    }

    if (trackEl) trackEl.innerText = spotify.song || "\u2014";
    if (artistEl) artistEl.innerText = spotify.artist || "\u2014";
    if (statusMsg) statusMsg.innerHTML = "\ud83c\udfa7 listening on Spotify";
}

function processLanyardData(data) {
    if (!data) return;
    updateDiscordUI(data);
    const spotify = data.spotify || null;
    updateSpotifyUI(spotify);
    trackSpotifyHistory(spotify);

    // Re-render recently played if the render function is available
    if (window.renderRecentSpotify) {
        window.renderRecentSpotify();
    }
}

// Expose for main.js to use
window.getRecentlyPlayed = getRecentlyPlayed;
window.clearRecentlyPlayed = async function() {
    localStorage.removeItem(RECENTLY_PLAYED_KEY);
    lastTrackKey = null;
    await clearRecentlyPlayedOnServer();
    if (window.renderRecentSpotify) window.renderRecentSpotify();
};
window.loadRecentlyPlayedFromServer = loadRecentlyPlayedFromServer;

async function fetchLanyard() {
    try {
        const res = await fetch(LANYARD_API);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (json.success && json.data) {
            processLanyardData(json.data);
        }
    } catch (err) {
        console.warn("Lanyard fetch failed:", err.message);
    }
}

function setupRefreshButton() {
    const refreshBtn = document.getElementById("refreshSpotifyBtn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", fetchLanyard);
    }
}

function initDiscordSpotify() {
    // Fetch immediately
    fetchLanyard();

    // Poll every 15 seconds (faster than WebSocket complexity)
    setInterval(fetchLanyard, 15000);

    // Setup manual refresh button
    setupRefreshButton();
}

// Start when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiscordSpotify);
} else {
    initDiscordSpotify();
}
