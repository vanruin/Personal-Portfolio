
# ✦ name's corner — anime portfolio ✦

> a cozy, aesthetic portfolio for creatives, anime lovers, and dreamers

![portfolio preview](https://placehold.co/800x400/f5e5d8/8b5a3f?text=anime+portfolio+preview)

## 🌸 about

welcome to **name's corner** — a personalized portfolio website designed for artists, developers, and anime enthusiasts. this template blends soft aesthetics, interactive elements, and a fully functional admin panel to showcase your projects, music taste, anime list, friends, and journal entries.

built with love for the **she/they**, **brazilian**, **anime-loving** community ✨

---

## ✨ features

### 🎨 frontend portfolio
- responsive, mobile-friendly design
- anime-themed loading screen with animated quotes and progress bar
- dynamic sections: projects, friends, playlist, anime gallery, journal
- spotify-inspired playlist display
- ghibli-vibes color palette (cream, terracotta, soft brown)
- floating animations, twinkling stars, and vinyl record spinner

### 🛠️ admin dashboard
- full CRUD management for all content
- **projects** — add title, description, tags, links, and media (image/video)
- **friends** — add names, emojis, descriptions, and profile pictures
- **playlist** — manage songs with artist names and custom emojis
- **anime list** — upload images for each anime title
- **journal** — write entries with optional images
- **data management** — export/import JSON backups, reset to default, clear all data
- **localStorage persistence** — all data saves automatically in your browser

### 🎭 interactive elements
- loading screen with rotating anime quotes and progress simulation
- starry background animation
- hover effects, smooth transitions, and card-based layout
- file upload previews for images/videos

---

## 📂 project structure

```
portfolio/
├── index.html          # main portfolio page
├── admin.html          # admin dashboard (standalone)
├── css/
│   └── admin.css       # admin panel styles
├── js/
│   ├── data.js         # data management logic
│   ├── firebase-data.js # firebase integration (optional)
│   └── admin-dashboard.js # dashboard functionality
├── assets/
│   └── images/         # default avatars, backgrounds
└── README.md
```

---

## 🚀 getting started

### 1. clone or download
```bash
git clone https://github.com/yourusername/anime-portfolio.git
cd anime-portfolio
```

### 2. open the portfolio
simply open `index.html` in your browser — no build step required!

### 3. access admin panel
open `admin.html` in your browser to start managing content.

> **note:** all data is stored in your browser's localStorage. no backend needed!

---

## 🎮 how to use

### portfolio page
- scroll through sections: about, projects, playlist, anime, journal
- loading screen appears on first visit (simulated 0–100% progress)
- all content is dynamically loaded from localStorage

### admin dashboard
1. click on any tab (projects, friends, playlist, anime, journal, settings)
2. fill out the form and click "add" — your content appears instantly
3. delete items using the trash icon on each card
4. **settings tab** lets you:
   - export all data as JSON backup
   - import previously saved JSON files
   - reset to default example data
   - clear all data completely

---

## 🎨 customization

### colors & theme
edit the CSS variables in `style` blocks (or separate CSS files):

```css
/* warm cream base */
background: #faf3ea;
/* accent terracotta */
color: #c27e56;
/* dark text */
color: #2b211c;
```

### default data
modify the `defaultData` object inside `admin.html` (or `data.js`) to change:

- example projects, friends, songs, anime titles, journal entries

### loading screen quotes
edit the `quotesLibrary` array in the loading screen script to add your favorite anime quotes.

### firebase integration (optional)
by default, the dashboard uses localStorage. to connect firebase:

1. uncomment the firebase script tags in `admin.html`
2. configure `firebase-data.js` with your firebase config
3. data will sync across devices

---

## 📱 responsive design

| device | breakpoint | behavior |
|--------|-----------|----------|
| desktop | > 768px | full grid layout, side-by-side cards |
| tablet | 481–768px | stacked forms, 2-column grid |
| mobile | < 480px | single column, compact buttons |

---

## 🧰 technologies used

- **html5** — semantic structure
- **css3** — flexbox, grid, animations, gradients
- **javascript (vanilla)** — no frameworks, pure DOM manipulation
- **localstorage api** — persistent client-side storage
- **font awesome 6** — icons
- **google fonts** — inter typeface

---

## 🤝 contributing

suggestions and improvements are welcome! feel free to:

1. fork the repository
2. create a feature branch (`git checkout -b feature/amazing-thing`)
3. commit changes (`git commit -m 'add amazing thing'`)
4. push to branch (`git push origin feature/amazing-thing`)
5. open a pull request

---

## 🌟 future ideas

- [ ] dark mode toggle
- [ ] spotify api integration (real now-playing widget)
- [ ] myanimelist/anilist integration for automatic anime tracking
- [ ] comment/kudos system for journal entries
- [ ] password protection for admin panel
- [ ] cloud sync (firebase already supported)

---

## 📄 license

this project is **open source** and available under the **mit license**. feel free to use, modify, and share!

---

## 💌 credits

- designed with 🧡 by jovan
- inspired by studio ghibli, city pop aesthetics, and cozy web
- placeholder images via [placehold.co](https://placehold.co)
- icons by [font awesome](https://fontawesome.com)

---

## 📬 contact

have questions or just want to share your version?

- **instagram:** vanruin
- **spotify:** vanruin

---

<p align="center">
  <img src="https://placehold.co/100x100/f5e5d8/8b5a3f?text=🐈‍⬛" width="60">
  <br>
  <i>made with ☕ and anime soundtracks</i>
</p>
```