require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB;

// ─── Multer config for file uploads ───
const UPLOAD_PATHS = {
    project: path.join(__dirname, 'assets', 'project'),
    journal: path.join(__dirname, 'assets', 'journal'),
    'journal-image': path.join(__dirname, 'assets', 'journal', 'image'),
    friendspfp: path.join(__dirname, 'assets', 'friendspfp'),
    anime: path.join(__dirname, 'assets', 'anime')
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.body.type || 'project';
        const dest = UPLOAD_PATHS[type] || UPLOAD_PATHS.project;
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = crypto.randomBytes(12).toString('hex');
        cb(null, `${unique}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedImages = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
        const allowedVideos = /\.(mp4|webm|mov|avi)$/i;
        if (allowedImages.test(path.extname(file.originalname)) ||
            allowedVideos.test(path.extname(file.originalname))) {
            cb(null, true);
        } else {
            cb(new Error('Only images (jpg, png, gif, webp, svg) and videos (mp4, webm, mov) are allowed'));
        }
    }
});

// ─── Middleware ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── File upload endpoint ───
app.post('/api/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            }
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path.replace(/\\/g, '/');
        const relativePath = filePath.substring(filePath.indexOf('assets/'));
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(req.file.originalname);

        res.json({
            success: true,
            url: '/' + relativePath,
            type: isImage ? 'image' : 'video',
            filename: req.file.filename,
            originalName: req.file.originalname
        });
    });
});

// ─── Delete uploaded file ───
app.delete('/api/upload', (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });

    const filePath = path.join(__dirname, url.replace(/^\//, ''));
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Recently played Spotify ───
const RECENTLY_PLAYED_FILE = path.join(__dirname, 'data', 'recently-played.json');

function loadRecentlyPlayedFromFile() {
    try {
        if (fs.existsSync(RECENTLY_PLAYED_FILE)) {
            const raw = fs.readFileSync(RECENTLY_PLAYED_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.warn('Failed to load recently-played.json:', err.message);
    }
    return [];
}

function saveRecentlyPlayedToFile(tracks) {
    try {
        const dir = path.dirname(RECENTLY_PLAYED_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(RECENTLY_PLAYED_FILE, JSON.stringify(tracks, null, 2), 'utf-8');
    } catch (err) {
        console.warn('Failed to save recently-played.json:', err.message);
    }
}

app.get('/api/spotify/recent', (req, res) => {
    res.json(loadRecentlyPlayedFromFile());
});

app.post('/api/spotify/recent', (req, res) => {
    const { song, artist, album, albumArt } = req.body;
    if (!song || !artist) {
        return res.status(400).json({ error: 'song and artist are required' });
    }

    const tracks = loadRecentlyPlayedFromFile();
    const key = (song + ' - ' + artist).toLowerCase().trim();
    const filtered = tracks.filter(t => 
        (t.song + ' - ' + t.artist).toLowerCase().trim() !== key
    );
    filtered.unshift({
        song,
        artist,
        album: album || '',
        albumArt: albumArt || '',
        playedAt: new Date().toISOString(),
        timestamp: Date.now()
    });

    const trimmed = filtered.slice(0, 5);
    saveRecentlyPlayedToFile(trimmed);
    res.json({ success: true, tracks: trimmed });
});

app.delete('/api/spotify/recent', (req, res) => {
    saveRecentlyPlayedToFile([]);
    res.json({ success: true, tracks: [] });
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// ─── GitHub API proxy endpoints ───
app.get('/api/github/commits', async (req, res) => {
    try {
        const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=5&type=owner', {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'portfolio-app'
            }
        });
        if (!reposRes.ok) throw new Error(`GitHub API error: ${reposRes.status}`);
        const repos = await reposRes.json();

        const commitPromises = repos.map(async (repo) => {
            const commitsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=3`, {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'portfolio-app'
                }
            });
            if (!commitsRes.ok) return [];
            const commits = await commitsRes.json();
            return commits.map(c => ({
                repo: repo.name,
                repoUrl: repo.html_url,
                message: c.commit.message.split('\n')[0],
                date: c.commit.committer.date,
                url: c.html_url,
                author: c.commit.author.name
            }));
        });

        const allCommits = (await Promise.all(commitPromises)).flat();
        allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allCommits.slice(0, 20));
    } catch (err) {
        console.error('GitHub commits error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/github/contributions', async (req, res) => {
    try {
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'portfolio-app'
            }
        });
        if (!userRes.ok) throw new Error(`GitHub API error: ${userRes.status}`);
        const user = await userRes.json();
        const username = user.login;

        const query = `
        {
            user(login: "${username}") {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                                color
                            }
                        }
                    }
                }
            }
        }`;

        const graphRes = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'portfolio-app'
            },
            body: JSON.stringify({ query })
        });

        if (!graphRes.ok) throw new Error(`GraphQL error: ${graphRes.status}`);
        const graphData = await graphRes.json();

        if (graphData.errors) {
            throw new Error(graphData.errors[0].message);
        }

        const calendar = graphData.data.user.contributionsCollection.contributionCalendar;

        res.json({
            username,
            avatar: user.avatar_url,
            profileUrl: user.html_url,
            totalContributions: calendar.totalContributions,
            weeks: calendar.weeks.map(w => ({
                days: w.contributionDays.map(d => ({
                    count: d.contributionCount,
                    date: d.date,
                    color: d.color
                }))
            }))
        });
    } catch (err) {
        console.error('GitHub contributions error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/github/profile', async (req, res) => {
    try {
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'portfolio-app'
            }
        });
        if (!userRes.ok) throw new Error(`GitHub API error: ${userRes.status}`);
        const user = await userRes.json();
        res.json({
            username: user.login,
            avatar: user.avatar_url,
            profileUrl: user.html_url,
            name: user.name,
            bio: user.bio,
            publicRepos: user.public_repos,
            followers: user.followers,
            following: user.following
        });
    } catch (err) {
        console.error('GitHub profile error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✨ Portfolio running at http://localhost:${PORT}`);
    console.log(`📁 Admin panel at http://localhost:${PORT}/admin/index.html`);
});
