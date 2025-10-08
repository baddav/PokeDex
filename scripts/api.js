// alt
// const BASE = 'https://pokeapi.co/api/v2/';

// neu: dein Backend
const BASE = 'http://localhost:3000/api/v1/';



const cache = {
    pokemon: new Map(), // id|name -> data
    species: new Map(),
    listPages: new Map(), // key = `${limit}:${offset}`
    namesList: null, // array of {name, url}
    sprite: new Map()
};

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text || url}`);
    }
    return res.json();
}

// getPokemonList => nutzt /pokemon?limit=&offset=&q=
export async function getPokemonList({limit=20, offset=0, q=''} = {}) {
    const k = `list:${limit}:${offset}:${q}`;
    if (cache.listPages.has(k)) return cache.listPages.get(k);
    const url = new URL(`${BASE}pokemon`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    if (q) url.searchParams.set('q', q);
    const data = await fetchJSON(url.toString());
    cache.listPages.set(k, data);
    return data;
}

// getPokemon bleibt (Pfad wurde Backend-kompatibel)
export async function getPokemon(idOrName) {
    const key = String(idOrName).toLowerCase();
    if (cache.pokemon.has(key)) return cache.pokemon.get(key);
    const data = await fetchJSON(`${BASE}pokemon/${key}`);
    cache.pokemon.set(key, data);
    cache.pokemon.set(String(data.id), data);
    return data;
}

// getSpecies bleibt (Pfad wurde Backend-kompatibel)
export async function getSpecies(idOrName) {
    const key = String(idOrName).toLowerCase();
    if (cache.species.has(key)) return cache.species.get(key);
    const data = await fetchJSON(`${BASE}pokemon-species/${key}`);
    cache.species.set(key, data);
    cache.species.set(String(data.id), data);
    return data;
}

// getAllPokemonNames => eigener Names-Endpoint
export async function getAllPokemonNames() {
    if (cache.namesList) return cache.namesList;
    const data = await fetchJSON(`${BASE}names`);
    cache.namesList = data; // [{name, url:"pokemon/1"}]
    return cache.namesList;
}

export function getOfficialArtworkSprite(pokemon) {
    const key = String(pokemon.id);
    if (cache.sprite.has(key)) return cache.sprite.get(key);
    const sprite =
        pokemon?.sprites?.other?.['official-artwork']?.front_default ||
        pokemon?.sprites?.front_default ||
        '';
    cache.sprite.set(key, sprite);
    return sprite;
}

/**
 * Try to resolve German or English name to Pokémon ID.
 * Best effort: checks direct lookup, then scans popular ID windows.
 */
const popularWindows = [
    [1, 200],
    [200, 500],
    [500, 1025]
];

export async function resolveNameToIdBestEffort(name) {
    const q = String(name).trim().toLowerCase();

    // Try direct lookup via /pokemon/{name}
    try {
        const p = await getPokemon(q);
        return p.id;
    } catch (_) {}

    // Try German/English name scan in known ID ranges
    async function tryWindow(start, end) {
        for (let id = start; id <= end; id++) {
            try {
                const s = await getSpecies(id);
                const de = (s.names || []).find(n => n.language?.name === 'de')?.name?.toLowerCase();
                const en = (s.names || []).find(n => n.language?.name === 'en')?.name?.toLowerCase();
                if (de === q || en === q) return id;
            } catch {
                /* ignore errors */
            }
        }
        return null;
    }

    for (const [a, b] of popularWindows) {
        const id = await tryWindow(a, b);
        if (id) return id;
    }
    return null;
}

export function normalizePokemonForUI(p) {
    const sprite = getOfficialArtworkSprite(p) || '';
    const name = p.name;
    return { ...p, _sprite: sprite, _displayName: name };
}
