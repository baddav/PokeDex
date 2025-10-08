import { createEl } from '../ui/utils.js';
import { isFavorite, state, removeFavorite } from '../state.js';
import { getPokemon, normalizePokemonForUI } from '../api.js';
import { pokemonCard } from '../ui/card.js';

export function renderCollection({ mount }) {
    const wrap = createEl('section', { className: 'section container' });
    wrap.innerHTML = `
    <div class="section-head">
      <div>
        <h1>PokeCollection</h1>
        <p>Deine Favoriten. Du kannst sie durchsuchen, sortieren und entfernen.</p>
      </div>
      <div class="row">
        <select id="sort" class="input" style="width:auto">
          <option value="id">Sortierung: ID</option>
          <option value="name">Sortierung: Name</option>
        </select>
        <input id="filter" class="input" placeholder="Schnellsuche…" style="width:220px"/>
      </div>
    </div>
    <div id="grid" class="grid gallery"></div>
    <div id="empty" class="empty" style="display:none">
      Noch keine Favoriten – füge welche in der Suche oder Galerie hinzu!
    </div>
  `;
    mount.appendChild(wrap);

    const grid = wrap.querySelector('#grid');
    const empty = wrap.querySelector('#empty');
    const sel = wrap.querySelector('#sort');
    const filter = wrap.querySelector('#filter');

    let data = []; // Normalisierte Pokémon

    function refreshEmpty() {
        empty.style.display = data.length ? 'none' : 'block';
    }

    async function load() {
        const ids = Array.from(state.favorites);
        const pokes = await Promise.all(
            ids.map(id =>
                getPokemon(id)
                    .then(normalizePokemonForUI)
                    .catch(() => null)
            )
        );
        data = pokes.filter(Boolean);
        render();
    }

    function render() {
        const q = filter.value.trim().toLowerCase();
        const sorted = [...data].sort((a, b) =>
            sel.value === 'name' ? a.name.localeCompare(b.name) : a.id - b.id
        );
        const filtered = q
            ? sorted.filter(p => p.name.includes(q) || String(p.id) === q)
            : sorted;

        grid.innerHTML = '';
        for (const p of filtered) {
            const card = pokemonCard(p, {
                isFavorite: true,
                onToggleFavorite: (poke, liked) => {
                    if (!liked) {
                        removeFavorite(poke.id);
                    }
                },
                onOpen: poke => {
                    location.hash = `#/pokemon/${poke.id}`;
                }
            });
            grid.appendChild(card);
        }
        refreshEmpty();
    }

    sel.addEventListener('change', render);
    filter.addEventListener('input', render);

    const onFavs = () => load();
    state.events.addEventListener('favorites-changed', onFavs);

    load();

    return () => {
        state.events.removeEventListener('favorites-changed', onFavs);
    };
}
