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
        if (entry.mediaUrl) {
            if (entry.mediaType === 'video') {
                mediaHtml = `<video class="journal-entry-media" src="${entry.mediaUrl}" controls preload="metadata"></video>`;
            } else {
                mediaHtml = `<img class="journal-entry-media" src="${entry.mediaUrl}" alt="journal image" loading="lazy">`;
            }
        }

        return `
            <div class="journal-entry" data-key="${entry.fbKey || ''}">
                <div class="journal-entry-header">
                    <span class="journal-entry-date">${formattedDate}</span>
                    <button class="journal-delete-btn" data-key="${entry.fbKey || ''}" title="delete entry">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="journal-entry-text">${linkedText}</div>
                ${mediaHtml}
            </div>
        `;
    }).join('');

    // Attach delete handlers
    container.querySelectorAll('.journal-delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const key = this.getAttribute('data-key');
            if (key && confirm('delete this entry?')) {
                window.deleteJournalEntryFromFirebase(key);
            }
        });
    });
}

// ─── File upload helper ───
async function uploadJournalImage(file) {
    if (!file) return { url: '', mediaType: '' };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'journal');

    try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return { url: data.url, mediaType: data.type };
    } catch (err) {
        console.error('Upload error:', err);
        return { url: '', mediaType: '' };
    }
}

function setupJournalForm() {
    const textarea = document.getElementById("journalEntryInput");
    const submitBtn = document.getElementById("journalSubmitBtn");
    const imageInput = document.getElementById("journalImageInput");
    const fileNameSpan = document.getElementById("journalFileName");

    if (!textarea || !submitBtn) return;

    // Show selected file name
    imageInput?.addEventListener("change", function() {
        if (this.files[0]) {
            fileNameSpan.textContent = '📎 ' + this.files[0].name;
        } else {
            fileNameSpan.textContent = '';
        }
    });

    const submit = async function() {
        const text = textarea.value.trim();
        if (!text && (!imageInput || !imageInput.files[0])) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> saving...';

        // Upload image if selected
        let mediaUrl = '', mediaType = '';
        if (imageInput && imageInput.files[0]) {
            const result = await uploadJournalImage(imageInput.files[0]);
            mediaUrl = result.url;
            mediaType = result.mediaType;
        }

        window.saveJournalEntryToFirebase(text, mediaUrl, mediaType);
        textarea.value = '';
        if (imageInput) imageInput.value = '';
        if (fileNameSpan) fileNameSpan.textContent = '';
        textarea.focus();

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-pen-fancy"></i> write';
    };

    submitBtn.addEventListener("click", submit);

    textarea.addEventListener("keydown", function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            submit();
        }
    });
}

function initJournal() {
    setupJournalForm();

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
