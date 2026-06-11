// Firebase debug helper — add this to index.html to test
(function() {
    window.debugFirebase = {
        checkData: function() {
            if (!window.fbDb || !window.fbRef || !window.fbOnValue) {
                console.error("Firebase not available");
                return;
            }
            console.log("=== Firebase Debug ===");
            const paths = [
                "portfolio/projects",
                "portfolio/friends", 
                "portfolio/playlist",
                "portfolio/anime",
                "portfolio/journal"
            ];
            paths.forEach(path => {
                const ref = window.fbRef(window.fbDb, path);
                window.fbOnValue(ref, (snapshot) => {
                    const val = snapshot.val();
                    console.log(`📁 ${path}:`, val ? (Array.isArray(val) ? `${val.length} items` : typeof val) : "EMPTY");
                    if (val && Array.isArray(val)) {
                        val.forEach((item, i) => {
                            if (typeof item === 'object') {
                                console.log(`  [${i}]:`, Object.keys(item));
                                if (item.imageUrl) console.log(`    imageUrl: ${item.imageUrl.substring(0, 50)}...`);
                                if (item.mediaUrl) console.log(`    mediaUrl: ${item.mediaUrl.substring(0, 50)}...`);
                            } else {
                                console.log(`  [${i}]: ${String(item).substring(0, 50)}`);
                            }
                        });
                    }
                }, { onlyOnce: true });
            });
        },
        writeTestAnime: function() {
            if (typeof saveAnimeToFirebase === 'function') {
                saveAnimeToFirebase("🔥 Test " + new Date().toLocaleTimeString(), "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
                console.log("✅ Test anime written to Firebase");
            } else {
                console.error("❌ saveAnimeToFirebase not available");
            }
        },
        writeTestJournal: function() {
            if (typeof saveAdminJournalEntryToFirebase === 'function') {
                saveAdminJournalEntryToFirebase("Test Entry " + new Date().toLocaleTimeString(), "This is a test journal entry", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
                console.log("✅ Test journal written to Firebase");
            } else {
                console.error("❌ saveAdminJournalEntryToFirebase not available");
            }
        }
    };
    console.log("🔥 Firebase debug helpers loaded. Run in console:");
    console.log("  debugFirebase.checkData()     — check what's in Firebase");
    console.log("  debugFirebase.writeTestAnime()  — write test anime");
    console.log("  debugFirebase.writeTestJournal() — write test journal");
})();
