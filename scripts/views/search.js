import { getAllPokemonNames, getPokemon, normalizePokemonForUI, getSpecies, resolveNameToIdBestEffort } from '../api.js';
import { pokemonCard } from '../ui/card.js';
import { debounce, createEl, formatId } from '../ui/utils.js';
import { toast } from '../ui/toast.js';
import { createProgressBar } from '../ui/progressbar.js';
import { addFavorite, removeFavorite, isFavorite } from '../state.js';

export function renderSearch({ mount }) {
    const wrap = createEl('section', { className: 'section container' });
    wrap.innerHTML = `
    <div class="section-head">
      <div>
        <h1>PokeSearch</h1>
        <p>Suche nach einem Pokémon (de/en, Groß-/Kleinschreibung egal). Drücke Enter für die Detailansicht.</p>
      </div>
    </div>
    <div class="panel searchbox">
      <label for="q" class="visually-hidden">Pokémon suchen</label>
      <div class="suggest">
        <input id="q" class="input" type="text" placeholder="z. B. Bisasam / Bulbasaur / #1" aria-autocomplete="list" aria-controls="suggest-list" aria-expanded="false" aria-haspopup="listbox" />
        <ul id="suggest-list" class="suggest-list" role="listbox" aria-label="Vorschläge"></ul>
      </div>
    </div>

    <div class="section">
      <div class="section-head">
        <h2>Pokémon-Fakt</h2>
      </div>
      <div class="panel" id="facts-panel">
        <div class="row" id="fact-row" style="justify-content:space-between; align-items:center">
          <div id="fact-left"></div>
          <div id="fact-right" style="min-width:220px; max-width:420px; margin-left:10px">
            <div id="fact-text" style="min-height: 68px"></div>
            <div id="fact-progress" style="margin-top:8px"></div>
          </div>
        </div>
      </div>
    </div>
  `;
    mount.appendChild(wrap);

    // Autocomplete
    const input = wrap.querySelector('#q');
    const list = wrap.querySelector('#suggest-list');
    let activeIndex = -1;

    function closeList() {
        list.classList.remove('open');
        input.setAttribute('aria-expanded', 'false');
        list.innerHTML = '';
        activeIndex = -1;
    }

    function openList() {
        list.classList.add('open');
        input.setAttribute('aria-expanded', 'true');
    }

    const updateSuggest = debounce(async () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
            closeList();
            return;
        }
        const all = await getAllPokemonNames();
        const matches = all.filter(it => it.name.includes(q)).slice(0, 8);
        list.innerHTML = '';
        if (matches.length === 0) {
            closeList();
            return;
        }
        for (const [i, m] of matches.entries()) {
            const id = parseInt(m.url.split('/').filter(Boolean).pop(), 10);
            const li = createEl('li', {
                className: 'suggest-item',
                attrs: { role: 'option', 'aria-selected': 'false', 'data-id': String(id) }
            });
            li.innerHTML = `
        <img alt="" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" width="36" height="36"/>
        <span>${m.name}</span>
        <span style="margin-left:auto; opacity:.7">${formatId(id)}</span>
      `;
            li.addEventListener('click', () => {
                navigateTo(id);
            });
            list.appendChild(li);
        }
        openList();
    }, 300);

    input.addEventListener('input', updateSuggest);
    input.addEventListener('keydown', e => {
        const options = Array.from(list.children);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!list.classList.contains('open')) openList();
            activeIndex = Math.min(options.length - 1, activeIndex + 1);
            updateActive(options);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(0, activeIndex - 1);
            updateActive(options);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && options[activeIndex]) {
                const id = options[activeIndex].getAttribute('data-id');
                navigateTo(id);
            } else {
                handleDirectSearch(input.value);
            }
        } else if (e.key === 'Escape') {
            closeList();
        }
    });
    input.addEventListener('blur', () => setTimeout(closeList, 120));

    function updateActive(options) {
        options.forEach((el, i) => el.setAttribute('aria-selected', String(i === activeIndex)));
    }

    async function handleDirectSearch(raw) {
        const q = String(raw).trim();
        if (!q) return;

        const asId = q.replace('#', '').trim();
        if (/^\d+$/.test(asId)) {
            location.hash = `#/pokemon/${asId}`;
            return;
        }

        try {
            const p = await getPokemon(q.toLowerCase());
            location.hash = `#/pokemon/${p.id}`;
            return;
        } catch {}

        const id = await resolveNameToIdBestEffort(q);
        if (id) {
            location.hash = `#/pokemon/${id}`;
            return;
        }

        toast('Kein Treffer. Probiere englischen Namen oder ID.');
    }

    function navigateTo(id) {
        location.hash = `#/pokemon/${id}`;
    }

    // Pokémon-Fakt-Rotator
    let timer = null;
    let progress;

    async function showRandomFact() {
        const id = 1 + Math.floor(Math.random() * 1010);
        try {
            const sp = await getSpecies(id);
            const genus =
                (sp.genera || []).find(g => g.language?.name === 'de')?.genus ||
                (sp.genera || []).find(g => g.language?.name === 'en')?.genus || '';
            const flavor =
                (sp.flavor_text_entries || []).find(f => f.language?.name === 'de')?.flavor_text ||
                (sp.flavor_text_entries || []).find(f => f.language?.name === 'en')?.flavor_text || '';
            const nameDe = (sp.names || []).find(n => n.language?.name === 'de')?.name || sp.name;
            const left = wrap.querySelector('#fact-left');
            left.innerHTML = `
        <div class="row">
          <strong style="font-size:1.1rem">${nameDe}</strong>
          <span style="opacity:.7">${genus ? ' – ' + genus : ''}</span>
        </div>
      `;
            const right = wrap.querySelector('#fact-text');
            right.textContent = flavor.replace(/\s+/g, ' ');

            const progWrap = wrap.querySelector('#fact-progress');
            progWrap.innerHTML = '';
            progress?.destroy();
            progress = createProgressBar({ duration: 10000 });
            progWrap.appendChild(progress.el);
        } catch {
            // ignorieren
        }
    }

    function startFacts() {
        showRandomFact();
        timer = setInterval(showRandomFact, 10000);
    }

    function stopFacts() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        progress?.destroy();
    }

    startFacts();

    const onVis = () => {
        if (document.hidden) stopFacts();
        else startFacts();
    };

    document.addEventListener('visibilitychange', onVis);

    return () => {
        stopFacts();
        document.removeEventListener('visibilitychange', onVis);
    };
}
