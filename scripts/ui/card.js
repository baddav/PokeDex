import { formatId, createEl, lazyImage } from './utils.js';

export function pokemonCard(p, { isFavorite = false, onToggleFavorite, onOpen } = {}) {
    const card = createEl('article', {
        className: 'card',
        attrs: { tabindex: '0', role: 'button', 'aria-label': `${p.name}` }
    });

    const media = createEl('div', { className: 'card-media' });
    const img = new Image();
    img.alt = p.name;
    img.decoding = 'async';
    img.setAttribute('data-src', p._sprite);
    lazyImage(img);
    media.appendChild(img);

    const body = createEl('div', { className: 'card-body' });
    const row = createEl('div', { className: 'row' });

    const title = createEl('div', { className: 'row' });
    title.style.justifyContent = 'space-between';
    const name = createEl('strong', { text: capitalizeName(p._displayName || p.name) });
    const id = createEl('span', { text: formatId(p.id) });
    id.style.opacity = 0.7;

    const fav = createEl('button', {
        className: 'heart',
        attrs: {
            'aria-label': isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen',
            title: isFavorite ? 'Favorit' : 'Favorisieren'
        }
    });
    fav.innerHTML = heartIcon(isFavorite);

    title.append(name, id);
    row.append(title, fav);
    body.append(row);

    const typesRow = createEl('div', { className: 'row' });
    for (const t of p.types || []) {
        const badge = createEl('span', {
            className: `badge type-${t.type.name}`,
            text: t.type.name
        });
        badge.style.textTransform = 'capitalize';
        typesRow.appendChild(badge);
    }
    body.appendChild(typesRow);

    card.append(media, body);

    // Klicks & Favoritenlogik
    card.addEventListener('click', e => {
        if (e.target.closest('.heart')) return;
        if (onOpen) onOpen(p);
    });

    card.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            if (onOpen) onOpen(p);
        }
    });

    fav.addEventListener('click', e => {
        e.stopPropagation();
        isFavorite = !isFavorite;
        fav.classList.toggle('liked', isFavorite);
        fav.setAttribute(
            'aria-label',
            isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'
        );
        fav.innerHTML = heartIcon(isFavorite);
        if (onToggleFavorite) onToggleFavorite(p, isFavorite);
    });

    fav.classList.toggle('liked', isFavorite);

    return card;
}

function heartIcon(filled) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="${
        filled
            ? 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
            : 'M16.5 3.5c-1.74 0-3.41 1.01-4.22 2.53C11.47 4.51 9.8 3.5 8.06 3.5 5.56 3.5 3.56 5.5 3.56 8c0 3.78 3.4 6.86 8.55 11.54C17.26 14.86 20.66 11.78 20.66 8c0-2.5-2-4.5-4.5-4.5z'
    }" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"/>
  </svg>`;
}

function capitalizeName(s) {
    return (s || '').charAt(0).toUpperCase() + (s || '').slice(1);
}
