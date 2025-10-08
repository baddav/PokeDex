import { createEl } from './utils.js';

export function renderNavbar({ active, onToggleMenu } = {}) {
    const header = document.getElementById('app-header');
    header.innerHTML = '';

    const nav = createEl('nav', {
        className: 'nav container',
        attrs: { 'aria-label': 'Hauptnavigation' }
    });

    // --- Linke Seite ---
    const left = createEl('div', { className: 'nav-left' });
    const brand = createEl('a', {
        className: 'brand',
        attrs: { href: '#/search', 'aria-label': 'Startseite' }
    });
    const logo = new Image();
    logo.src = './assets/logo.svg';
    logo.alt = '';
    const title = createEl('span', { className: 'brand-title', text: 'Pokedex' });
    brand.append(logo, title);
    left.appendChild(brand);

    // --- Mobile Toggle ---
    const toggle = createEl('button', {
        className: 'btn nav-toggle',
        attrs: {
            'aria-expanded': 'false',
            'aria-controls': 'main-menu',
            'aria-label': 'Menü umschalten'
        }
    });
    toggle.textContent = 'Menü';

    // Menücontainer
    const menu = createEl('div', {
        className: 'nav-menu',
        attrs: { id: 'main-menu' }
    });

    toggle.addEventListener('click', () => {
        const opened = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(opened));
        if (onToggleMenu) onToggleMenu(opened);
    });

    left.appendChild(toggle);

    // --- Menülinks ---
    const links = [
        ['#/search', 'PokeSearch'],
        ['#/gallery', 'PokeGallery'],
        ['#/collection', 'PokeCollection'],
        ['#/profile', 'PokeProfile']
    ];

    for (const [href, label] of links) {
        const a = createEl('a', {
            className: 'nav-link' + (href === active ? ' active' : ''),
            attrs: { href },
            text: label
        });
        menu.appendChild(a);
    }

    // --- Rechte Seite ---
    const right = createEl('div', { className: 'nav-right' });
    const profile = createEl('a', {
        className: 'btn ghost',
        attrs: { href: '#/profile' },
        text: 'Profil'
    });
    right.appendChild(profile);

    // --- Zusammenbauen ---
    nav.append(left, menu, right);
    header.appendChild(nav);
}
