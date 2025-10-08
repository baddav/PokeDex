import { getPokemon, getSpecies, normalizePokemonForUI } from '../api.js';
import { createEl, formatId, clamp } from '../ui/utils.js';
import { addFavorite, removeFavorite, isFavorite, state } from '../state.js';
import { toast } from '../ui/toast.js';

const STAT_LABELS = {
    hp: 'KP',
    attack: 'Angriff',
    defense: 'Verteidigung',
    'special-attack': 'Sp.-Angriff',
    'special-defense': 'Sp.-Verteidigung',
    speed: 'Initiative'
};

export function renderDetail({ mount, params }) {
    const idOrName = params[0];
    const wrap = createEl('section', { className: 'section container' });
    const content = createEl('div', { className: 'grid detail' });
    wrap.appendChild(content);
    mount.appendChild(wrap);

    load();

    async function load() {
        try {
            const p = normalizePokemonForUI(await getPokemon(idOrName));
            const sp = await getSpecies(p.id);
            state.cache.lastViewed = p.id;

            content.innerHTML = '';

            // Left: hero section
            const hero = createEl('div', { className: 'detail-hero' });
            hero.innerHTML = `
<div class="row" style="justify-content:space-between; align-items:center; margin-bottom:10px">
  <div class="row" style="gap:10px; align-items:baseline">
    <h1 style="margin:0">${(sp.names || []).find(n => n.language?.name === 'de')?.name || p.name}</h1>
    <span style="opacity:.7">${formatId(p.id)}</span>
  </div>
  <button id="fav" class="btn icon" aria-label="Favorisieren" title="Favorisieren">
    ${isFavorite(p.id) ? '★' : '☆'}
  </button>
</div>
<img alt="${p.name}" src="${p._sprite}" />
      `;
            content.appendChild(hero);

            // Right: metadata
            const meta = createEl('div', { className: 'panel detail-meta' });
            const types = p.types
                .map(t => `<span class="badge type-${t.type.name}">${t.type.name}</span>`)
                .join(' ');
            const abilities = p.abilities.map(a => a.ability?.name).join(', ');
            const heightM = (p.height / 10).toFixed(1);
            const weightKg = (p.weight / 10).toFixed(1);
            const flavor =
                (sp.flavor_text_entries || []).find(f => f.language?.name === 'de')?.flavor_text ||
                (sp.flavor_text_entries || []).find(f => f.language?.name === 'en')?.flavor_text ||
                '';

            meta.innerHTML = `
<h2>Details</h2>
<div class="kv" style="margin-bottom:10px">
  <div class="kv-row"><div class="kv-key">Typ</div><div>${types}</div></div>
  <div class="kv-row"><div class="kv-key">Größe</div><div>${heightM} m</div></div>
  <div class="kv-row"><div class="kv-key">Gewicht</div><div>${weightKg} kg</div></div>
  <div class="kv-row"><div class="kv-key">Fähigkeiten</div><div>${abilities || '–'}</div></div>
</div>
<h3>Basiswerte</h3>
<div class="stats" id="stats"></div>
<h3 style="margin-top:12px">Beschreibung</h3>
<p>${(flavor || '').replace(/\s+/g, ' ')}</p>
<div class="row" style="margin-top:12px">
  <button id="fav2" class="btn primary">
    ${isFavorite(p.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
  </button>
</div>
      `;
            content.appendChild(meta);

            // Stats bars
            const statsWrap = meta.querySelector('#stats');
            for (const s of p.stats || []) {
                const key = s.stat?.name;
                const label = STAT_LABELS[key] || key;
                const val = Number(s.base_stat) || 0;
                const row = createEl('div', { className: 'stat' });
                row.innerHTML = `<div>${label}</div><div class="stat-bar"><span style="width:0%"></span></div>`;
                statsWrap.appendChild(row);
                // animate
                requestAnimationFrame(() => {
                    const span = row.querySelector('span');
                    span.style.width = Math.round(clamp(val, 0, 180) / 180 * 100) + '%';
                });
            }

            // Favorite buttons
            function updateFavButtons(favNow) {
                const favBtn = hero.querySelector('#fav');
                if (favBtn) favBtn.textContent = favNow ? '★' : '☆';
                const fav2 = meta.querySelector('#fav2');
                if (fav2)
                    fav2.textContent = favNow
                        ? 'Aus Favoriten entfernen'
                        : 'Zu Favoriten hinzufügen';
            }

            hero.querySelector('#fav').addEventListener('click', () => {
                const favNow = isFavorite(p.id)
                    ? (removeFavorite(p.id), false)
                    : (addFavorite(p.id), true);
                toast(favNow ? 'Zu Favoriten hinzugefügt' : 'Aus Favoriten entfernt');
                updateFavButtons(favNow);
            });

            meta.querySelector('#fav2').addEventListener('click', () => {
                const favNow = isFavorite(p.id)
                    ? (removeFavorite(p.id), false)
                    : (addFavorite(p.id), true);
                toast(favNow ? 'Zu Favoriten hinzugefügt' : 'Aus Favoriten entfernt');
                updateFavButtons(favNow);
            });
        } catch (err) {
            content.innerHTML = `
<div class="panel">
  <h2>Fehler</h2>
  <p>Die Daten konnten nicht geladen werden. ${err?.message || ''}</p>
  <div class="row"><button id="retry" class="btn">Erneut versuchen</button></div>
</div>
      `;
            const btn = content.querySelector('#retry');
            if (btn) btn.addEventListener('click', load);
        }
    }

    return () => {};
}
