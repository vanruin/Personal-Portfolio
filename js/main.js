// Main rendering and initialization

function renderProjects() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;
    
    if (projectsData.length === 0) {
        container.innerHTML = `<div style="padding: 2rem; text-align:center; background:#faf5ef; border-radius:2rem;">✨ no projects yet — add some via admin ✨</div>`;
        return;
    }
    
    container.innerHTML = projectsData.map(proj => {
        let mediaHtml = '';
        if (proj.mediaUrl) {
            if (proj.mediaType === 'video') {
                mediaHtml = `<video class="project-media" src="${proj.mediaUrl}" controls preload="metadata"></video>`;
            } else {
                mediaHtml = `<img class="project-media" src="${proj.mediaUrl}" alt="${escapeHtml(proj.name)}" loading="lazy">`;
            }
        }
        const linkHtml = proj.link
            ? `<a href="${escapeHtml(proj.link)}" target="_blank" rel="noopener noreferrer" class="project-link-btn"><i class="fas fa-external-link-alt"></i> view project</a>`
            : '';
        return `
        <div class="project-card" data-project-id="${proj.id}">
            ${mediaHtml}
            <div class="project-title">
                <i class="fas fa-star"></i> 
                ${escapeHtml(proj.name)}
            </div>
            <div class="project-desc">${escapeHtml(proj.desc)}</div>
            <div class="project-tags">
                ${proj.tags.map(t => `<span>#${escapeHtml(t)}</span>`).join('')}
            </div>
            ${linkHtml}
        </div>
    `}).join('');
}

function renderFriends() {
    const container = document.getElementById("friendsContainer");
    if (!container) return;
    
    if (friendsData.length === 0) {
        container.innerHTML = `<div style="padding: 2rem; text-align:center;">💔 add your besties via admin panel</div>`;
        return;
    }
    
    container.innerHTML = friendsData.map(f => {
        const avatarHtml = f.pfpUrl
            ? `<img class="friend-avatar friend-avatar-img" src="${f.pfpUrl}" alt="${escapeHtml(f.name)}" loading="lazy">`
            : `<div class="friend-avatar">${f.emoji || '🌸'}</div>`;
        return `
        <div class="friend-card" data-friend-id="${f.id}">
            ${avatarHtml}
            <div class="friend-name">${escapeHtml(f.name)}</div>
            <div class="friend-desc">${escapeHtml(f.desc)}</div>
        </div>
    `}).join('');
}

function renderPlaylist() {
    const container = document.getElementById("playlistContainer");
    if (!container) return;
    
    container.innerHTML = playlistData.map(item => `
        <div class="playlist-item">
            <span class="music-note">${item.emoji || '🎵'}</span>
            ${escapeHtml(item.song)} - ${escapeHtml(item.artist)}
        </div>
    `).join('');
}

function renderAnime() {
    const container = document.getElementById("animeContainer");
    if (!container) return;

    // Support both object format (with title/imageUrl) and plain string
    const titles = animeData.map(a => {
        if (typeof a === 'string') return a;
        return a.title || a.name || a;
    });

    const itemsHtml = animeData.map(a => {
        const title = escapeHtml(typeof a === 'string' ? a : (a.title || a.name || a));
        const imageUrl = typeof a === 'object' ? (a.imageUrl || '') : '';
        const imgHtml = imageUrl
            ? `<img class="anime-item-img" src="${imageUrl}" alt="${title}" loading="lazy">`
            : '';
        return `<div class="anime-item">${imgHtml}<span>${title}</span></div>`;
    }).join('');

    container.innerHTML = `
        <div class="anime-list-inner">${itemsHtml || titles.join(' • ')}</div>
        <p style="margin-top: 0.6rem; font-style: normal; font-size: 0.9rem;">✨ currently watching: magical girl transformation</p>
    `;
}

function renderRecentSpotify() {
    const container = document.getElementById("recentlyPlayedContainer");
    if (!container) return;

    const tracks = window.getRecentlyPlayed ? window.getRecentlyPlayed() : [];

    if (tracks.length === 0) {
        container.innerHTML = '<div style="padding:0.8rem 0;font-size:0.85rem;color:#a08672;font-style:italic;">no tracks played yet — listen on Spotify and it will show up here ✨</div>';
        return;
    }

    container.innerHTML = tracks.map(t => {
        const timeAgo = getTimeAgo(t.timestamp);
        const artHtml = t.albumArt
            ? `<img src="${t.albumArt}" alt="" class="recent-album-art" loading="lazy">`
            : `<div class="recent-album-art recent-album-art-placeholder"><i class="fab fa-spotify"></i></div>`;
        return `
            <div class="recent-track">
                ${artHtml}
                <div class="recent-track-info">
                    <span class="recent-track-name">${escapeHtml(t.song)}</span>
                    <span class="recent-track-artist">${escapeHtml(t.artist)}</span>
                </div>
                <span class="recent-track-time">${timeAgo}</span>
            </div>
        `;
    }).join('');
}

function getTimeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    return days + 'd ago';
}

// Expose for spotify.js to call after each fetch
window.renderRecentSpotify = renderRecentSpotify;

// Clear recently played button
(function setupClearButton() {
    const clearBtn = document.getElementById("clearRecentBtn");
    if (clearBtn && window.clearRecentlyPlayed) {
        clearBtn.addEventListener("click", function() {
            window.clearRecentlyPlayed();
        });
    }
})();

// Initial render
(async function init() {
    // Try to load from server first
    if (window.loadRecentlyPlayedFromServer) {
        await window.loadRecentlyPlayedFromServer();
    }

    // Load all data from Firebase (falls back to localStorage)
    if (window.loadAllFromFirebase) {
        window.loadAllFromFirebase(() => {
            renderProjects();
            renderFriends();
            renderPlaylist();
            renderAnime();
            renderRecentSpotify();
        });
    } else {
        renderProjects();
        renderFriends();
        renderPlaylist();
        renderAnime();
        renderRecentSpotify();
    }
})();

// Re-render when needed (exposed to global for admin)
window.refreshPortfolio = function() {
    renderProjects();
    renderFriends();
    renderPlaylist();
    renderAnime();
    renderRecentSpotify();
};
