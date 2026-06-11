// Firebase data layer — replaces localStorage for portfolio data
// Uses dynamic import() to load Firebase SDK

const DB_PATH = {
    PROJECTS: "portfolio/projects",
    FRIENDS: "portfolio/friends",
    PLAYLIST: "portfolio/playlist",
    ANIME: "portfolio/anime",
    JOURNAL: "portfolio/journal"
};

let fbDb = null;
let fbRef, fbSet, fbPush, fbOnValue, fbRemove, fbUpdate;
let firebaseReady = false;
let readyCallbacks = [];

function onFirebaseReady(cb) {
    if (firebaseReady) {
        cb();
    } else {
        readyCallbacks.push(cb);
    }
}

// ─── Dynamic import of Firebase ───
async function initFirebase() {
    try {
        const fbModule = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js");
        const dbModule = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js");

        const firebaseConfig = {
            apiKey: "AIzaSyAfA5QcsHQaD6shBdwhQp6atxbAxJnyt24",
            authDomain: "portfolio-814e6.firebaseapp.com",
            databaseURL: "https://portfolio-814e6-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "portfolio-814e6",
            storageBucket: "portfolio-814e6.firebasestorage.app",
            messagingSenderId: "234359999283",
            appId: "1:234359999283:web:0d64aefe957564f1860c46",
            measurementId: "G-CDPTFQMKV3"
        };

        const app = fbModule.initializeApp(firebaseConfig);
        fbDb = dbModule.getDatabase(app);

        // Also init analytics (doesn't block)
        try {
            const analyticsModule = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js");
            analyticsModule.getAnalytics(app);
        } catch (e) { /* analytics optional */ }

        // Extract functions
        fbRef = dbModule.ref;
        fbSet = dbModule.set;
        fbPush = dbModule.push;
        fbOnValue = dbModule.onValue;
        fbRemove = dbModule.remove;
        fbUpdate = dbModule.update;

        // Also expose globally for module script compatibility
        window.fbDb = fbDb;
        window.fbRef = fbRef;
        window.fbSet = fbSet;
        window.fbPush = fbPush;
        window.fbOnValue = fbOnValue;
        window.fbRemove = fbRemove;
        window.fbUpdate = fbUpdate;

        firebaseReady = true;
        window.fbAppReady = true;

        // Fire queued callbacks
        readyCallbacks.forEach(cb => cb());
        readyCallbacks = [];

        console.log('🔥 Firebase initialized via dynamic import');
    } catch (err) {
        console.warn('⚠️ Firebase init failed, using localStorage fallback:', err.message);
        // Still fire callbacks so portfolio renders from localStorage
        firebaseReady = true;
        readyCallbacks.forEach(cb => cb());
        readyCallbacks = [];
    }
}

// ─── Convert Firebase snapshot object to array ───
function snapshotToArray(snapshot) {
    const items = [];
    if (!snapshot) return items;
    snapshot.forEach(child => {
        const val = child.val();
        if (val) {
            items.push({ ...val, fbKey: child.key });
        }
    });
    return items;
}

// ─── Generic realtime listener ───
function listenToFirebase(path, callback) {
    onFirebaseReady(() => {
        if (!fbDb) {
            callback(null);
            return;
        }
        const dbRef = fbRef(fbDb, path);
        fbOnValue(dbRef, (snapshot) => {
            const data = snapshotToArray(snapshot);
            callback(data);
        }, { onlyOnce: false });
    });
}

// ─── Load helpers that get called when Firebase data arrives ───
function loadProjectsFromFirebase(callback) {
    listenToFirebase(DB_PATH.PROJECTS, (items) => {
        if (items && items.length > 0) {
            projectsData = items;
        } else {
            // Firebase has no projects — clear local data too
            projectsData = [];
            saveProjects();
        }
        if (callback) callback();
        if (typeof window.refreshPortfolio === 'function') {
            window.refreshPortfolio();
        }
    });
}

function loadFriendsFromFirebase(callback) {
    listenToFirebase(DB_PATH.FRIENDS, (items) => {
        if (items && items.length > 0) {
            friendsData = items;
        }
        if (callback) callback();
        if (typeof window.refreshPortfolio === 'function') {
            window.refreshPortfolio();
        }
    });
}

function loadPlaylistFromFirebase(callback) {
    listenToFirebase(DB_PATH.PLAYLIST, (items) => {
        if (items && items.length > 0) {
            playlistData = items;
        }
        if (callback) callback();
        if (typeof window.refreshPortfolio === 'function') {
            window.refreshPortfolio();
        }
    });
}

function loadAnimeFromFirebase(callback) {
    listenToFirebase(DB_PATH.ANIME, (items) => {
        if (items && items.length > 0) {
            animeData = items.map(item => {
                // Handle string, { name }, { title }, { name, imageUrl }, or { title, imageUrl }
                if (typeof item === 'string') return { name: item, imageUrl: '' };
                const name = item.title || item.name || String(item) || '';
                return { name, imageUrl: item.imageUrl || '' };
            });
        }
        if (callback) callback();
        if (typeof window.refreshPortfolio === 'function') {
            window.refreshPortfolio();
        }
    });
}

function loadJournalFromFirebase(callback) {
    listenToFirebase(DB_PATH.JOURNAL, (items) => {
        const entries = (items || []).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        if (callback) callback(entries);
        // Journal has its own render, but trigger portfolio refresh too
        if (typeof window.renderJournalEntries === 'function') {
            window.renderJournalEntries();
        }
    });
}

// ─── Save helpers ───
function saveProjectToFirebase(project) {
    onFirebaseReady(() => {
        if (!fbDb) return;
        const newRef = fbPush(fbRef(fbDb, DB_PATH.PROJECTS));
        fbSet(newRef, {
            name: project.name,
            desc: project.desc,
            tags: project.tags || [],
            link: project.link || '',
            date: project.date || new Date().toISOString().split('T')[0],
            mediaUrl: project.mediaUrl || '',
            mediaType: project.mediaType || ''
        });
    });
}

function updateProjectInFirebase(fbKey, updates) {
    onFirebaseReady(() => {
        if (!fbDb || !fbKey) return;
        fbUpdate(fbRef(fbDb, DB_PATH.PROJECTS + '/' + fbKey), updates);
    });
}

function deleteProjectFromFirebase(fbKey) {
    onFirebaseReady(() => {
        if (!fbDb || !fbKey) return;
        fbRemove(fbRef(fbDb, DB_PATH.PROJECTS + '/' + fbKey));
    });
}

function saveFriendToFirebase(friend) {
    onFirebaseReady(() => {
        if (!fbDb) return;
        const newRef = fbPush(fbRef(fbDb, DB_PATH.FRIENDS));
        fbSet(newRef, {
            name: friend.name,
            desc: friend.desc,
            emoji: friend.emoji || '🌸',
            vibe: friend.vibe || '',
            pfpUrl: friend.pfpUrl || ''
        });
    });
}

function deleteFriendFromFirebase(fbKey) {
    onFirebaseReady(() => {
        if (!fbDb || !fbKey) return;
        fbRemove(fbRef(fbDb, DB_PATH.FRIENDS + '/' + fbKey));
    });
}

function savePlaylistToFirebase(item) {
    onFirebaseReady(() => {
        if (!fbDb) return;
        const newRef = fbPush(fbRef(fbDb, DB_PATH.PLAYLIST));
        fbSet(newRef, { song: item.song, artist: item.artist, emoji: item.emoji || '🎵' });
    });
}

function deletePlaylistFromFirebase(fbKey) {
    onFirebaseReady(() => {
        if (!fbDb || !fbKey) return;
        fbRemove(fbRef(fbDb, DB_PATH.PLAYLIST + '/' + fbKey));
    });
}

function saveAnimeToFirebase(title, imageUrl) {
    onFirebaseReady(() => {
        if (!fbDb) return;
        const newRef = fbPush(fbRef(fbDb, DB_PATH.ANIME));
        fbSet(newRef, { title: title, imageUrl: imageUrl || '' });
    });
}

function deleteAnimeFromFirebase(fbKey) {
    onFirebaseReady(() => {
        if (!fbDb || !fbKey) return;
        fbRemove(fbRef(fbDb, DB_PATH.ANIME + '/' + fbKey));
    });
}

function saveJournalEntryToFirebase(text, mediaUrl, mediaType) {
    onFirebaseReady(() => {
        if (!fbDb) return;
        const newRef = fbPush(fbRef(fbDb, DB_PATH.JOURNAL));
        fbSet(newRef, {
            text: text,
            timestamp: Date.now(),
            date: new Date().toISOString(),
            mediaUrl: mediaUrl || '',
            mediaType: mediaType || ''
        });
    });
}

function saveAdminJournalEntryToFirebase(title, description, imageUrl) {
    onFirebaseReady(() => {
        if (!fbDb) return;
        const newRef = fbPush(fbRef(fbDb, DB_PATH.JOURNAL));
        fbSet(newRef, {
            title: title,
            description: description,
            text: description,
            imageUrl: imageUrl || '',
            mediaUrl: imageUrl || '',
            mediaType: imageUrl ? 'image' : '',
            timestamp: Date.now(),
            date: new Date().toISOString()
        });
    });
}

function deleteJournalEntryFromFirebase(fbKey) {
    onFirebaseReady(() => {
        if (!fbDb || !fbKey) return;
        fbRemove(fbRef(fbDb, DB_PATH.JOURNAL + '/' + fbKey));
    });
}

function clearAllJournalOnFirebase() {
    onFirebaseReady(() => {
        if (!fbDb) return;
        fbSet(fbRef(fbDb, DB_PATH.JOURNAL), null);
    });
}

// ─── Load all data from Firebase ───
function loadAllFromFirebase(callback) {
    onFirebaseReady(() => {
        let loaded = 0;
        const total = 4;
        const checkDone = () => {
            loaded++;
            if (loaded >= total) {
                if (callback) callback();
            }
        };
        loadProjectsFromFirebase(checkDone);
        loadFriendsFromFirebase(checkDone);
        loadPlaylistFromFirebase(checkDone);
        loadAnimeFromFirebase(checkDone);
    });
}

// ─── Export globally ───
window.loadAllFromFirebase = loadAllFromFirebase;
window.loadJournalFromFirebase = loadJournalFromFirebase;
window.saveProjectToFirebase = saveProjectToFirebase;
window.updateProjectInFirebase = updateProjectInFirebase;
window.deleteProjectFromFirebase = deleteProjectFromFirebase;
window.saveFriendToFirebase = saveFriendToFirebase;
window.deleteFriendFromFirebase = deleteFriendFromFirebase;
window.savePlaylistToFirebase = savePlaylistToFirebase;
window.deletePlaylistFromFirebase = deletePlaylistFromFirebase;
window.saveAnimeToFirebase = saveAnimeToFirebase;
window.deleteAnimeFromFirebase = deleteAnimeFromFirebase;
window.saveJournalEntryToFirebase = saveJournalEntryToFirebase;
window.saveAdminJournalEntryToFirebase = saveAdminJournalEntryToFirebase;
window.deleteJournalEntryFromFirebase = deleteJournalEntryFromFirebase;
window.clearAllJournalOnFirebase = clearAllJournalOnFirebase;

// ─── Start Firebase initialization ───
initFirebase();

console.log('📦 Firebase data layer loaded');
