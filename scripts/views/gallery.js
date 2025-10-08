import { getPokemonList, getPokemon, normalizePokemonForUI } from '../api.js';
import { pokemonCard } from '../ui/card.js';
import { createEl } from '../ui/utils.js';
import { isFavorite, toggleFavorite } from '../state.js';

export function renderGallery({ mount }) {
    const wrap = createEl('section', { className: 'section container' });
    wrap.innerHTML = `
    <div class="section-head">
      <div>
        <h1>PokeGallery</h1>
        <p>Stöbere durch die Pokémon – 20 pro Seite.</p>
      </div>
      <div class="section-actions">
        <button id="load-more" class="btn">Mehr laden</button>
      </div>
    </div>
    <div id="grid" class="grid gallery"></div>
  `;
    mount.appendChild(wrap);

    const grid = wrap.querySelector('#grid');
    const btn = wrap.querySelector('#load-more');
    let offset = 0;
    let loading = false;

    btn.addEventListener('click', loadNext);

    async function loadNext() {
        if (loading) return;
        loading = true;
        btn.disabled = true;
        btn.textContent = 'Laden…';
        try {
            const list = await getPokemonList({ limit: 20, offset });
            const ids = list.results.map(x =>
                parseInt(x.url.split('/').filter(Boolean).pop(), 10)
            );
            const promises = ids.map(id => getPokemon(id).catch(() => null));
            const pokes = (await Promise.all(promises))
                .filter(Boolean)
                .map(normalizePokemonForUI);

            for (const p of pokes) {
                const card = pokemonCard(p, {
                    isFavorite: isFavorite(p.id),
                    onToggleFavorite: (poke, liked) => {
                        toggleFavorite(poke.id);
                    },
                    onOpen: poke => {
                        location.hash = `#/pokemon/${poke.id}`;
                    }
                });
                grid.appendChild(card);
            }

            offset += 20;
        } finally {
            loading = false;
            btn.disabled = false;
            btn.textContent = 'Mehr laden';
        }
    }

    loadNext();

    return () => {};
}
