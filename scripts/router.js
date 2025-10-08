import { renderNavbar } from './ui/navbar.js';
import { renderSearch } from './views/search.js';
import { renderGallery } from './views/gallery.js';
import { renderCollection } from './views/collection.js';
import { renderProfile } from './views/profile.js';
import { renderDetail } from './views/detail.js';
import { state, applyTheme } from './state.js';

const routes = [
    { path: /^#\/search$/, view: renderSearch, name: '#/search' },
    { path: /^#\/gallery$/, view: renderGallery, name: '#/gallery' },
    { path: /^#\/collection$/, view: renderCollection, name: '#/collection' },
    { path: /^#\/profile$/, view: renderProfile, name: '#/profile' },
    { path: /^#\/pokemon\/(\d+|[a-z-]+)$/, view: renderDetail, name: null }
];

let cleanup = null;

export function router() {
    applyTheme();
    const hash = location.hash || '#/search';
    const main = document.getElementById('app-main');
    const match = routes.find(r => r.path.test(hash)) || routes[0];

    // Cleanup falls vorheriger View Aufräumfunktion hat
    if (cleanup) {
        try {
            cleanup();
        } catch {}
        cleanup = null;
    }

    // Navbar immer neu rendern
    renderNavbar({ active: match.name || '#/search' });

    // Hauptbereich vorbereiten
    main.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'container';
    main.appendChild(el);

    // Parameter (z. B. ID bei /pokemon/:id)
    const m = hash.match(match.path);
    cleanup = match.view({ mount: el, params: m?.slice(1) || [] });
}

// Router neu ausführen, wenn sich die URL (Hash) ändert
window.addEventListener('hashchange', router);
