// Navigation between sections
const sections = {
    home: document.getElementById("home-section"),
    projects: document.getElementById("projects-section"),
    friends: document.getElementById("friends-section"),
    music: document.getElementById("music-section"),
    github: document.getElementById("github-section")
};

const navSpans = document.querySelectorAll("#navLinks span");

function switchToSection(sectionId) {
    // Update active nav style
    navSpans.forEach(span => {
        if (span.getAttribute("data-section") === sectionId) {
            span.classList.add("active");
        } else {
            span.classList.remove("active");
        }
    });
    
    // Hide all sections
    Object.values(sections).forEach(sec => {
        if (sec) sec.classList.remove("active-section");
    });
    
    // Show selected section
    if (sections[sectionId]) {
        sections[sectionId].classList.add("active-section");
    }
    
    // Re-render dynamic content if needed
    if (sectionId === "projects" && typeof renderProjects === 'function') {
        renderProjects();
    }
    if (sectionId === "friends" && typeof renderFriends === 'function') {
        renderFriends();
    }
    if (sectionId === "music" && typeof renderPlaylist === 'function') {
        renderPlaylist();
        renderAnime();
    }
}

// Add event listeners
navSpans.forEach(span => {
    span.addEventListener("click", () => {
        const sectionId = span.getAttribute("data-section");
        if (sectionId) switchToSection(sectionId);
    });
});

// Set active section based on hash or default
function initNavigation() {
    const hash = window.location.hash.slice(1);
    if (hash && sections[hash]) {
        switchToSection(hash);
    } else {
        switchToSection("home");
    }
}

initNavigation();
