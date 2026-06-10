// Default portfolio data
const defaultProjectsData = [
    { id: 1, name: "✦ dreamscape zine", desc: "digital collage & poetry collection about soft futures, dreams, and growing up.", tags: ["art", "poetry", "indie"], date: "2024" },
    { id: 2, name: "🌸 cozynotes", desc: "aesthetic note-taking web app with pastel UI, markdown support, and local storage.", tags: ["design", "ui/ux", "react"], date: "2024" },
    { id: 3, name: "🎧 lofi radio widget", desc: "customizable web radio player with chill beats, animated visualizer, and playlist.", tags: ["js", "music", "widget"], date: "2023" },
    { id: 4, name: "🍰 100 days of code", desc: "creative coding challenge – generative art, mini games, and interactive sketches.", tags: ["creative coding", "p5js"], date: "2024" },
    { id: 5, name: "🌿 study with me", desc: "pomodoro timer + lo-fi beats + aesthetic background for productivity.", tags: ["productivity", "vanilla js"], date: "2024" }
];

const defaultFriendsData = [
    { id: 1, name: "luna ✨", desc: "my emotional support art buddy & midnight ramen partner", emoji: "🎨", vibe: "chaotic good" },
    { id: 2, name: "mochi 🐇", desc: "always sends the best playlists and knows my coffee order", emoji: "🍜", vibe: "soft energy" },
    { id: 3, name: "kai 🌊", desc: "deep talks at 3am, book recs, and matching tattoos soon", emoji: "🎧", vibe: "ocean calm" },
    { id: 4, name: "june 🕯️", desc: "my ride or die since middle school, literally my twin flame", emoji: "📖", vibe: "warm hug" },
    { id: 5, name: "remi 🍓", desc: "co-op gaming partner & professional chaos coordinator", emoji: "🎮", vibe: "chaotic good" }
];

const defaultPlaylist = [
    { song: "money", artist: "the drums", emoji: "🎸" },
    { song: "i love u", artist: "the walters", emoji: "💖" },
    { song: "space song", artist: "beach house", emoji: "🌙" },
    { song: "yellow", artist: "coldplay", emoji: "💛" },
    { song: "we fell in love in october", artist: "girl in red", emoji: "🍂" },
    { song: "Show Me How", artist: "Men I Trust", emoji: "🌊" }
];

const defaultAnimeList = [
    "Natsume's Book of Friends",
    "Frieren: Beyond Journey's End",
    "Dungeon Meshi",
    "Soul Eater",
    "Spy x Family",
    "Howl's Moving Castle"
];

// Global state
let projectsData = [...defaultProjectsData];
let friendsData = [...defaultFriendsData];
let playlistData = [...defaultPlaylist];
let animeData = [...defaultAnimeList];

// LocalStorage keys
const STORAGE_KEYS = {
    PROJECTS: "name_portfolio_projects",
    FRIENDS: "name_portfolio_friends",
    PLAYLIST: "name_portfolio_playlist",
    ANIME: "name_portfolio_anime"
};

// Load from localStorage
function loadAllData() {
    const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const storedFriends = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    const storedPlaylist = localStorage.getItem(STORAGE_KEYS.PLAYLIST);
    const storedAnime = localStorage.getItem(STORAGE_KEYS.ANIME);
    
    if (storedProjects) projectsData = JSON.parse(storedProjects);
    if (storedFriends) friendsData = JSON.parse(storedFriends);
    if (storedPlaylist) playlistData = JSON.parse(storedPlaylist);
    if (storedAnime) animeData = JSON.parse(storedAnime);
}

// Save to localStorage
function saveProjects() {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projectsData));
}

function saveFriends() {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friendsData));
}

function savePlaylist() {
    localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(playlistData));
}

function saveAnime() {
    localStorage.setItem(STORAGE_KEYS.ANIME, JSON.stringify(animeData));
}

// Helper functions
function addProject(project) {
    const newId = projectsData.length > 0 ? Math.max(...projectsData.map(p => p.id)) + 1 : 1;
    projectsData.push({ ...project, id: newId, link: project.link || '' });
    saveProjects();
}

function updateProject(id, updatedProject) {
    const index = projectsData.findIndex(p => p.id === id);
    if (index !== -1) {
        projectsData[index] = { ...projectsData[index], ...updatedProject };
        saveProjects();
    }
}

function deleteProject(id) {
    projectsData = projectsData.filter(p => p.id !== id);
    saveProjects();
}

function addFriend(friend) {
    const newId = friendsData.length > 0 ? Math.max(...friendsData.map(f => f.id)) + 1 : 1;
    friendsData.push({ ...friend, id: newId });
    saveFriends();
}

function updateFriend(id, updatedFriend) {
    const index = friendsData.findIndex(f => f.id === id);
    if (index !== -1) {
        friendsData[index] = { ...friendsData[index], ...updatedFriend };
        saveFriends();
    }
}

function deleteFriend(id) {
    friendsData = friendsData.filter(f => f.id !== id);
    saveFriends();
}

function resetToDefault() {
    projectsData = JSON.parse(JSON.stringify(defaultProjectsData));
    friendsData = JSON.parse(JSON.stringify(defaultFriendsData));
    playlistData = JSON.parse(JSON.stringify(defaultPlaylist));
    animeData = JSON.parse(JSON.stringify(defaultAnimeList));
    
    saveProjects();
    saveFriends();
    savePlaylist();
    saveAnime();
}

// Initialize
loadAllData();
