// Admin dashboard functionality

let currentProjects = [...projectsData];
let currentFriends = [...friendsData];
let currentPlaylist = [...playlistData];
let currentAnime = [...animeData];
let journalAdminEntries = [];

// Render functions
function renderAdminProjects() {
    const container = document.getElementById("projectsList");
    if (!container) return;
    
    if (currentProjects.length === 0) {
        container.innerHTML = '<div class="empty-message">✨ no projects yet — add your first project above ✨</div>';
        return;
    }
    
    container.innerHTML = currentProjects.map(proj => {
        const linkHtml = proj.link
            ? `<div style="margin-top:4px;"><a href="${escapeHtml(proj.link)}" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem;color:#9b6e53;text-decoration:underline;"><i class="fas fa-external-link-alt"></i> ${escapeHtml(proj.link)}</a></div>`
            : '';
        return `
        <div class="list-item" data-id="${proj.id}" data-fbkey="${proj.fbKey || ''}">
            <div class="list-item-info">
                <div class="list-item-title">${escapeHtml(proj.name)}</div>
                <div class="list-item-desc">${escapeHtml(proj.desc)}</div>
                <div class="list-item-tags">${(proj.tags || []).map(t => `<span>#${escapeHtml(t)}</span>`).join('')}</div>
                ${linkHtml}
            </div>
            <div>
                <button class="delete-btn" onclick="deleteProjectItem('${proj.fbKey || ''}', ${proj.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `}).join('');
}

function renderAdminFriends() {
    const container = document.getElementById("friendsList");
    if (!container) return;
    
    if (currentFriends.length === 0) {
        container.innerHTML = '<div class="empty-message">💔 no friends added yet — add your besties! 💔</div>';
        return;
    }
    
    container.innerHTML = currentFriends.map(f => `
        <div class="list-item" data-id="${f.id}" data-fbkey="${f.fbKey || ''}">
            <div class="list-item-info">
                <div class="list-item-title">${f.emoji || '🌸'} ${escapeHtml(f.name)}</div>
                <div class="list-item-desc">${escapeHtml(f.desc)}</div>
            </div>
            <button class="delete-btn" onclick="deleteFriendItem('${f.fbKey || ''}', ${f.id})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function renderAdminPlaylist() {
    const container = document.getElementById("playlistList");
    if (!container) return;
    
    if (currentPlaylist.length === 0) {
        container.innerHTML = '<div class="empty-message">🎵 no songs yet — add some music 🎵</div>';
        return;
    }
    
    container.innerHTML = currentPlaylist.map((song, index) => `
        <div class="list-item" data-index="${index}" data-fbkey="${song.fbKey || ''}">
            <div class="list-item-info">
                <div class="list-item-title">${song.emoji || '🎵'} ${escapeHtml(song.song)} — ${escapeHtml(song.artist)}</div>
            </div>
            <button class="delete-btn" onclick="deletePlaylistItem('${song.fbKey || ''}', ${index})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function renderAdminAnime() {
    const container = document.getElementById("animeList");
    if (!container) return;
    
    if (currentAnime.length === 0) {
        container.innerHTML = '<div class="empty-message">📺 no anime yet — add your favorites 📺</div>';
        return;
    }
    
    container.innerHTML = currentAnime.map((anime, index) => `
        <div class="list-item" data-index="${index}" data-fbkey="${anime.fbKey || ''}">
            <div class="list-item-info">
                <div class="list-item-title">📺 ${escapeHtml(anime.title || anime.name || anime)}</div>
            </div>
            <button class="delete-btn" onclick="deleteAnimeItem('${anime.fbKey || ''}', ${index})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function renderAdminJournal() {
    const container = document.getElementById("journalAdminList");
    if (!container) return;

    if (journalAdminEntries.length === 0) {
        container.innerHTML = '<div class="empty-message">📝 no journal entries yet</div>';
        return;
    }

    container.innerHTML = journalAdminEntries.map(entry => {
        const date = entry.date
            ? new Date(entry.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })
            : '';

        const title = entry.title || '';
        const description = entry.description || entry.text || '';

        let imageHtml = '';
        const imgUrl = entry.imageUrl || entry.mediaUrl || '';
        if (imgUrl) {
            imageHtml = `<img src="${imgUrl}" alt="${escapeHtml(title)}" class="admin-journal-image" loading="lazy">`;
        }

        return `
            <div class="list-item" data-fbkey="${entry.fbKey || ''}">
                <div class="list-item-info">
                    ${title ? `<div class="list-item-title" style="font-size:0.95rem;font-weight:600;">${escapeHtml(title)}</div>` : ''}
                    ${description ? `<div class="list-item-desc" style="font-size:0.85rem;">${escapeHtml(description)}</div>` : ''}
                    ${imageHtml}
                    <div style="font-size:0.7rem;color:#a08672;margin-top:4px;">${date}</div>
                </div>
                <button class="delete-btn" onclick="deleteJournalEntry('${entry.fbKey || ''}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
    }).join('');
}

// Load journal entries for admin
function loadJournalForAdmin() {
    if (window.loadJournalFromFirebase) {
        window.loadJournalFromFirebase((entries) => {
            journalAdminEntries = entries || [];
            renderAdminJournal();
        });
    }
}

// CRUD operations
window.deleteProjectItem = function(fbKey, id) {
    if (!confirm('Delete this project?')) return;
    if (fbKey && window.deleteProjectFromFirebase) {
        window.deleteProjectFromFirebase(fbKey);
    }
    deleteProject(id);
    currentProjects = [...projectsData];
    renderAdminProjects();
    if (typeof refreshPortfolio === 'function') refreshPortfolio();
};

window.deleteFriendItem = function(fbKey, id) {
    if (!confirm('Remove this friend?')) return;
    if (fbKey && window.deleteFriendFromFirebase) {
        window.deleteFriendFromFirebase(fbKey);
    }
    deleteFriend(id);
    currentFriends = [...friendsData];
    renderAdminFriends();
    if (typeof refreshPortfolio === 'function') refreshPortfolio();
};

window.deletePlaylistItem = function(fbKey, index) {
    if (!confirm('Remove this song from playlist?')) return;
    if (fbKey && window.deletePlaylistFromFirebase) {
        window.deletePlaylistFromFirebase(fbKey);
    }
    playlistData.splice(index, 1);
    savePlaylist();
    currentPlaylist = [...playlistData];
    renderAdminPlaylist();
    if (typeof refreshPortfolio === 'function') refreshPortfolio();
};

window.deleteAnimeItem = function(fbKey, index) {
    if (!confirm('Remove this anime?')) return;
    if (fbKey && window.deleteAnimeFromFirebase) {
        window.deleteAnimeFromFirebase(fbKey);
    }
    animeData.splice(index, 1);
    saveAnime();
    currentAnime = [...animeData];
    renderAdminAnime();
    if (typeof refreshPortfolio === 'function') refreshPortfolio();
};

window.deleteJournalEntry = function(fbKey) {
    if (!fbKey || !confirm('Delete this journal entry?')) return;
    if (window.deleteJournalEntryFromFirebase) {
        window.deleteJournalEntryFromFirebase(fbKey);
    }
};

// ─── Project media preview ───
const projectMediaInput = document.getElementById("newProjectMedia");
const projectMediaPreview = document.getElementById("projectMediaPreview");

projectMediaInput?.addEventListener("change", function() {
    const file = this.files[0];
    if (!file) {
        projectMediaPreview.innerHTML = '';
        return;
    }
    
    projectMediaPreview.innerHTML = '';
    if (file.type.startsWith('video/')) {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(file);
        vid.controls = true;
        vid.style.maxWidth = '100%';
        vid.style.maxHeight = '150px';
        vid.style.borderRadius = '8px';
        projectMediaPreview.appendChild(vid);
    } else {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '100%';
        img.style.maxHeight = '150px';
        img.style.borderRadius = '8px';
        img.style.marginTop = '8px';
        projectMediaPreview.appendChild(img);
    }
});

// ─── Friend PFP preview ───
document.getElementById("newFriendPfp")?.addEventListener("change", function() {
    const preview = document.getElementById("friendPfpPreview");
    if (!preview) return;
    preview.innerHTML = '';
    const file = this.files[0];
    if (file && file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100px';
        img.style.borderRadius = '8px';
        img.style.marginTop = '8px';
        preview.appendChild(img);
    }
});

// ─── Anime image preview ───
document.getElementById("newAnimeImage")?.addEventListener("change", function() {
    const preview = document.getElementById("animeImagePreview");
    if (!preview) return;
    preview.innerHTML = '';
    const file = this.files[0];
    if (file && file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100px';
        img.style.borderRadius = '8px';
        img.style.marginTop = '8px';
        preview.appendChild(img);
    }
});

// ─── Upload helper ───
async function uploadFile(file, type) {
    if (!file) return { url: '', mediaType: '' };
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        return await res.json();
    } catch (err) {
        console.error('Upload error:', err);
        alert('Upload failed: ' + err.message);
        return { url: '', mediaType: '' };
    }
}

// Add handlers
document.getElementById("addProjectBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("addProjectBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> saving...';

    const name = document.getElementById("newProjectName")?.value.trim();
    const desc = document.getElementById("newProjectDesc")?.value.trim();
    const tagsRaw = document.getElementById("newProjectTags")?.value.trim();
    const link = document.getElementById("newProjectLink")?.value.trim() || '';
    
    if (!name || !desc) {
        alert("Please fill both name and description");
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> add project';
        return;
    }
    
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(t => t) : ["creative"];
    
    // Upload media if selected
    const mediaFile = document.getElementById("newProjectMedia")?.files[0];
    const { url: mediaUrl, mediaType } = await uploadFile(mediaFile, 'project');

    // Save to Firebase
    if (window.saveProjectToFirebase) {
        window.saveProjectToFirebase({ name, desc, tags, link, mediaUrl, mediaType });
    }
    
    addProject({ name, desc, tags, link, mediaUrl, mediaType });
    currentProjects = [...projectsData];
    renderAdminProjects();
    if (typeof refreshPortfolio === 'function') refreshPortfolio();
    
    document.getElementById("newProjectName").value = "";
    document.getElementById("newProjectDesc").value = "";
    document.getElementById("newProjectTags").value = "";
    document.getElementById("newProjectLink").value = "";
    document.getElementById("newProjectMedia").value = "";
    if (projectMediaPreview) projectMediaPreview.innerHTML = "";

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> add project';
});

document.getElementById("addFriendBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("addFriendBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> saving...';

    const name = document.getElementById("newFriendName")?.value.trim();
    const desc = document.getElementById("newFriendDesc")?.value.trim();
    const emoji = document.getElementById("newFriendEmoji")?.value.trim() || "🌸";
    
    if (!name || !desc) {
        alert("Please fill both name and description");
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> add friend';
        return;
    }

    const pfpFile = document.getElementById("newFriendPfp")?.files[0];
    const { url: pfpUrl } = await uploadFile(pfpFile, 'friendspfp');
    
    if (window.saveFriendToFirebase) {
        window.saveFriendToFirebase({ name, desc, emoji, pfpUrl });
    }
    
    addFriend({ name, desc, emoji, pfpUrl });
    currentFriends = [...friendsData];
    renderAdminFriends();
    if (typeof refreshPortfolio === 'function') refreshPortfolio();
    
    document.getElementById("newFriendName").value = "";
    document.getElementById("newFriendDesc").value = "";
    document.getElementById("newFriendEmoji").value = "";
    document.getElementById("newFriendPfp").value = "";
    document.getElementById("friendPfpPreview").innerHTML = "";

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> add friend';
});

document.getElementById("addSongBtn")?.addEventListener("click", () => {
    const song = document.getElementById("newSongName")?.value.trim();
    const artist = document.getElementById("newArtistName")?.value.trim();
    const emoji = document.getElementById("newSongEmoji")?.value.trim() || "🎵";
    
    if (!song || !artist) {
        alert("Please fill both song name and artist");
        return;
    }
    
    if (window.savePlaylistToFirebase) {
        window.savePlaylistToFirebase({ song, artist, emoji });
    }
    
    playlistData.push({ song, artist, emoji });
    savePlaylist();
    currentPlaylist = [...playlistData];
    renderAdminPlaylist();
    if (typeof refreshPortfolio === 'function') refreshPortfolio();
    
    document.getElementById("newSongName").value = "";
    document.getElementById("newArtistName").value = "";
    document.getElementById("newSongEmoji").value = "";
});

document.getElementById("addAnimeBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("addAnimeBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> saving...';

    const anime = document.getElementById("newAnimeName")?.value.trim();
    
    if (!anime) {
        alert("Please enter an anime title");
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> add anime';
        return;
    }

    const imgFile = document.getElementById("newAnimeImage")?.files[0];
    const { url: imageUrl } = await uploadFile(imgFile, 'anime');
    
    if (window.saveAnimeToFirebase) {
        window.saveAnimeToFirebase(anime, imageUrl);
    }
    
    animeData.push({ title: anime, imageUrl: imageUrl });
    saveAnime();
    currentAnime = [...animeData];
    renderAdminAnime();
    if (typeof refreshPortfolio === 'function') refreshPortfolio();
    
    document.getElementById("newAnimeName").value = "";
    document.getElementById("newAnimeImage").value = "";
    document.getElementById("animeImagePreview").innerHTML = "";

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> add anime';
});

// Clear all journal entries
document.getElementById("clearAllJournalBtn")?.addEventListener("click", () => {
    if (!confirm("⚠️ Delete ALL journal entries? This cannot be undone!")) return;
    if (window.clearAllJournalOnFirebase) {
        window.clearAllJournalOnFirebase();
    }
    journalAdminEntries = [];
    renderAdminJournal();
});

// Settings buttons
document.getElementById("exportDataBtn")?.addEventListener("click", () => {
    const allData = {
        projects: projectsData,
        friends: friendsData,
        playlist: playlistData,
        anime: animeData,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById("resetDefaultBtn")?.addEventListener("click", () => {
    if (confirm("⚠️ This will reset ALL data to default. Are you sure?")) {
        resetToDefault();
        currentProjects = [...projectsData];
        currentFriends = [...friendsData];
        currentPlaylist = [...playlistData];
        currentAnime = [...animeData];
        
        renderAdminProjects();
        renderAdminFriends();
        renderAdminPlaylist();
        renderAdminAnime();
        if (typeof refreshPortfolio === 'function') refreshPortfolio();
        
        alert("✨ Reset to default completed!");
    }
});

document.getElementById("clearAllBtn")?.addEventListener("click", () => {
    if (confirm("⚠️⚠️⚠️ This will DELETE ALL your data! Make a backup first! Are you absolutely sure?")) {
        projectsData = [];
        friendsData = [];
        playlistData = [];
        animeData = [];
        
        saveProjects();
        saveFriends();
        savePlaylist();
        saveAnime();
        
        currentProjects = [];
        currentFriends = [];
        currentPlaylist = [];
        currentAnime = [];
        
        renderAdminProjects();
        renderAdminFriends();
        renderAdminPlaylist();
        renderAdminAnime();
        if (typeof refreshPortfolio === 'function') refreshPortfolio();
        
        alert("🗑️ All data cleared!");
    }
});

// Import data
const importBtn = document.getElementById("importDataBtn");
const importFileInput = document.getElementById("importFileInput");

importBtn?.addEventListener("click", () => {
    importFileInput.click();
});

importFileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            
            if (importedData.projects) {
                projectsData = importedData.projects;
                saveProjects();
            }
            if (importedData.friends) {
                friendsData = importedData.friends;
                saveFriends();
            }
            if (importedData.playlist) {
                playlistData = importedData.playlist;
                savePlaylist();
            }
            if (importedData.anime) {
                animeData = importedData.anime;
                saveAnime();
            }
            
            currentProjects = [...projectsData];
            currentFriends = [...friendsData];
            currentPlaylist = [...playlistData];
            currentAnime = [...animeData];
            
            renderAdminProjects();
            renderAdminFriends();
            renderAdminPlaylist();
            renderAdminAnime();
            if (typeof refreshPortfolio === 'function') refreshPortfolio();
            
            alert("✅ Data imported successfully!");
        } catch (err) {
            alert("❌ Invalid JSON file");
        }
    };
    reader.readAsText(file);
    importFileInput.value = "";
});

// Tab switching
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");
        
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        tabContents.forEach(content => content.classList.remove("active"));
        document.getElementById(`${tabId}-tab`)?.classList.add("active");
        
        // Re-render current tab content
        if (tabId === "projects") renderAdminProjects();
        if (tabId === "friends") renderAdminFriends();
        if (tabId === "playlist") renderAdminPlaylist();
        if (tabId === "anime") renderAdminAnime();
        if (tabId === "journal") loadJournalForAdmin();
    });
});

// ─── Admin Journal image preview ───
document.getElementById("adminJournalImage")?.addEventListener("change", function() {
    const preview = document.getElementById("adminJournalImagePreview");
    if (!preview) return;
    preview.innerHTML = '';
    const file = this.files[0];
    if (file && file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '100%';
        img.style.maxHeight = '120px';
        img.style.borderRadius = '8px';
        img.style.marginTop = '8px';
        img.style.objectFit = 'cover';
        preview.appendChild(img);
    }
});

// ─── Admin Journal: Add Entry ───
document.getElementById("addAdminJournalBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("addAdminJournalBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> saving...';

    const title = document.getElementById("adminJournalTitle")?.value.trim();
    const description = document.getElementById("adminJournalDesc")?.value.trim();

    if (!title && !description) {
        alert("Please enter at least a title or a description");
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> add entry';
        return;
    }

    // Upload image if selected — use 'journal-image' type to save in assets/journal/image/
    const imgFile = document.getElementById("adminJournalImage")?.files[0];
    let imageUrl = '';
    if (imgFile) {
        const result = await uploadFile(imgFile, 'journal-image');
        imageUrl = result.url || '';
    }

    if (window.saveAdminJournalEntryToFirebase) {
        window.saveAdminJournalEntryToFirebase(title, description, imageUrl);
    }

    // Reset form
    document.getElementById("adminJournalTitle").value = "";
    document.getElementById("adminJournalDesc").value = "";
    document.getElementById("adminJournalImage").value = "";
    document.getElementById("adminJournalImagePreview").innerHTML = "";

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> add entry';
});

// Initial renders
renderAdminProjects();
renderAdminFriends();
renderAdminPlaylist();
renderAdminAnime();
loadJournalForAdmin();

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&';
        if (m === '<') return '<';
        if (m === '>') return '>';
        return m;
    });
}
