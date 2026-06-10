// GitHub commits & contributions widget
// Fetches data from the backend API proxy

async function fetchJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn(`GitHub fetch failed (${url}):`, err.message);
        return null;
    }
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&';
        if (m === '<') return '<';
        if (m === '>') return '>';
        return m;
    });
}

// --- Profile ---

async function renderProfile() {
    const container = document.getElementById('githubProfile');
    if (!container) return;

    const profile = await fetchJSON('/api/github/profile');
    if (!profile) {
        container.innerHTML = '<div class="github-empty">could not load github profile</div>';
        return;
    }

    container.innerHTML = `
        <a href="${profile.profileUrl}" target="_blank" class="github-profile-link" rel="noopener">
            <img src="${profile.avatar}" alt="${escapeHtml(profile.username)}" class="github-avatar" />
            <div class="github-profile-info">
                <div class="github-username">${escapeHtml(profile.name || profile.username)}</div>
                <div class="github-handle">@${escapeHtml(profile.username)}</div>
                <div class="github-stats">
                    <span><i class="fas fa-book"></i> ${profile.publicRepos} repos</span>
                    <span><i class="fas fa-users"></i> ${profile.followers} followers</span>
                </div>
            </div>
        </a>
    `;
}

// --- Commits ---

async function renderCommits() {
    const container = document.getElementById('githubCommits');
    if (!container) return;

    const commits = await fetchJSON('/api/github/commits');
    if (!commits || commits.length === 0) {
        container.innerHTML = `
            <div class="gh-card-title"><i class="fas fa-code-branch"></i> recent commits</div>
            <div class="github-empty">no recent commits</div>
        `;
        return;
    }

    const listHtml = commits.slice(0, 10).map(c => `
        <a href="${c.url}" target="_blank" class="commit-item" rel="noopener">
            <span class="commit-icon"><i class="fas fa-code-commit"></i></span>
            <span class="commit-body">
                <span class="commit-msg">${escapeHtml(c.message)}</span>
                <span class="commit-meta">
                    <span class="commit-repo">${escapeHtml(c.repo)}</span>
                    <span class="commit-date">${formatDate(c.date)}</span>
                </span>
            </span>
        </a>
    `).join('');

    container.innerHTML = `
        <div class="gh-card-title"><i class="fas fa-code-branch"></i> recent commits</div>
        <div class="gh-commits-inner">${listHtml}</div>
    `;
}

// --- Contribution Calendar ---

async function renderContributions() {
    const container = document.getElementById('githubContributions');
    if (!container) return;

    const data = await fetchJSON('/api/github/contributions');
    if (!data || !data.weeks || data.weeks.length === 0) {
        container.innerHTML = `
            <div class="gh-card-title"><i class="fas fa-calendar-alt"></i> contribution calendar</div>
            <div class="github-empty">could not load contributions</div>
        `;
        return;
    }

    const displayWeeks = data.weeks.slice(-20);

    const weeksHtml = displayWeeks.map(w => {
        const daysHtml = w.days.map(d => {
            const count = d.count;
            let level = 'contrib-0';
            if (count > 0 && count <= 3) level = 'contrib-1';
            else if (count > 3 && count <= 6) level = 'contrib-2';
            else if (count > 6 && count <= 9) level = 'contrib-3';
            else if (count > 9) level = 'contrib-4';
            return `<span class="contrib-day ${level}" title="${count} contributions on ${d.date}"></span>`;
        }).join('');
        return `<div class="contrib-week">${daysHtml}</div>`;
    }).join('');

    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    const labelsHtml = `<div class="contrib-day-labels">${dayLabels.map(l => `<span class="contrib-day-label">${l}</span>`).join('')}</div>`;

    container.innerHTML = `
        <div class="gh-card-title"><i class="fas fa-calendar-alt"></i> contribution calendar</div>
        <div class="gh-contrib-header">
            <span class="contrib-count">${data.totalContributions} contributions</span>
            <span class="contrib-label">in the last year</span>
        </div>
        <div class="contrib-grid">
            ${labelsHtml}
            <div class="contrib-weeks">${weeksHtml}</div>
        </div>
        <div class="contrib-legend">
            <span>Less</span>
            <span class="contrib-day contrib-0"></span>
            <span class="contrib-day contrib-1"></span>
            <span class="contrib-day contrib-2"></span>
            <span class="contrib-day contrib-3"></span>
            <span class="contrib-day contrib-4"></span>
            <span>More</span>
        </div>
    `;
}

// --- Main ---

async function renderGitHubWidgets() {
    await renderProfile();
    await renderCommits();
    await renderContributions();
}

function initGitHub() {
    renderGitHubWidgets();
    setInterval(renderGitHubWidgets, 300000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGitHub);
} else {
    initGitHub();
}
