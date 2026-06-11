// Journal section — write, display, and delete entries from Firebase

let journalEntries = [];

function renderJournalEntries() {
    const container = document.getElementById("journalEntriesContainer");
    if (!container) return;

    if (journalEntries.length === 0) {
        container.innerHTML = `
            <div class="journal-empty">
                <span class="journal-empty-icon">📝</span>
                <span>no entries yet — write something lovely ✨</span>
            </div>
        `;
        return;
    }

    container.innerHTML = journalEntries.map(entry => {
        const formattedDate = entry.date
            ? new Date(entry.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })
            : '';

        const entryText = escapeHtml(entry.text || '');
        const linkedText = entryText.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        let mediaHtml = '';
        const srcUrl = entry.mediaUrl || entry.imageUrl || '';
        if (srcUrl) {
            const mediaType = entry.mediaType || (srcUrl.startsWith('data:video') ? 'video' : 'image');
            if (mediaType === 'video') {
                mediaHtml = `<video class="journal-entry-media" src="${srcUrl}" controls preload="metadata"></video>`;
            } else {
                mediaHtml = `<img class="journal-entry-media" src="${srcUrl}" alt="journal image" loading="lazy">`;
            }
        }

        const titleHtml = entry.title
            ? `<div style="font-weight:600;font-size:1rem;color:#3d2c21;margin-bottom:0.3rem;">${escapeHtml(entry.title)}</div>`
            : '';

        return `
            <div class="journal-entry" data-key="${entry.fbKey || ''}">
                <div class="journal-entry-header">
                    <span class="journal-entry-date">${formattedDate}</span>
                </div>
                ${titleHtml}
                <div class="journal-entry-text">${linkedText}</div>
                ${mediaHtml}
            </div>
        `;
    }).join('');
}

function initJournal() {
    // Load from localStorage first as fallback
    if (typeof getJournalEntries === 'function') {
        const localEntries = getJournalEntries();
        if (localEntries.length > 0) {
            journalEntries = localEntries;
            renderJournalEntries();
        }
    }
    // Then load from Firebase (overrides)
    if (window.loadJournalFromFirebase) {
        window.loadJournalFromFirebase((entries) => {
            journalEntries = entries || [];
            renderJournalEntries();
        });
    }
}

window.refreshJournal = function() {
    if (window.loadJournalFromFirebase) {
        window.loadJournalFromFirebase((entries) => {
            journalEntries = entries || [];
            renderJournalEntries();
        });
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&';
        if (m === '<') return '<';
        if (m === '>') return '>';
        return m;
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initJournal);
} else {
    initJournal();
}
