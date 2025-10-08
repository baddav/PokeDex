import 'dotenv/config';
import fetch from 'node-fetch';
import { connectMongo } from '../utils/connectMongo.js';
import { Pokemon } from '../models/Pokemon.js';
import { Species } from '../models/Species.js';

const BASE = 'https://pokeapi.co/api/v2/';
// Passe das ggf. an (z.B. bis Gen 9/10). Hier: 1..1010
const MAX_ID = parseInt(process.env.MAX_ID || '1010', 10);

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
}

async function seed() {
    if (!process.env.MONGO_URI) {
        throw new Error('Missing MONGO_URI in .env');
    }
    await connectMongo(process.env.MONGO_URI);

    for (let id = 1; id <= MAX_ID; id++) {
        try {
            const [p, s] = await Promise.all([
                fetchJSON(`${BASE}pokemon/${id}`),
                fetchJSON(`${BASE}pokemon-species/${id}`)
            ]);

            // Upsert Pokemon
            await Pokemon.findOneAndUpdate(
                { id: p.id },
                {
                    id: p.id,
                    name: p.name,
                    height: p.height,
                    weight: p.weight,
                    abilities: p.abilities,
                    types: p.types,
                    sprites: p.sprites
                },
                { upsert: true, setDefaultsOnInsert: true }
            );

            // Upsert Species
            await Species.findOneAndUpdate(
                { id: s.id },
                {
                    id: s.id,
                    name: s.name,
                    genera: s.genera,
                    flavor_text_entries: s.flavor_text_entries,
                    names: s.names
                },
                { upsert: true, setDefaultsOnInsert: true }
            );

            if (id % 25 === 0) console.log(`Seeded up to #${id}`);
        } catch (e) {
            console.warn(`Skip #${id}:`, e.message);
        }
    }

    console.log('✅ Seeding finished');
    process.exit(0);
}

seed().catch(e => {
    console.error(e);
    process.exit(1);
});
