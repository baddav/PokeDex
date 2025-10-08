import { Pokemon } from '../models/Pokemon.js';
import { Species } from '../models/Species.js';

export async function listPokemon(req, res) {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const offset = parseInt(req.query.offset || '0', 10);
    const q = (req.query.q || '').trim().toLowerCase();

    const filter = q
        ? { name: { $regex: q, $options: 'i' } }
        : {};

    const total = await Pokemon.countDocuments(filter);
    const results = await Pokemon.find(filter)
        .sort({ id: 1 })
        .skip(offset)
        .limit(limit)
        .lean();

    // Emuliere PokeAPI-Form
    res.json({
        count: total,
        results: results.map(p => ({
            name: p.name,
            url: `pokemon/${p.id}`
        }))
    });
}

export async function getPokemon(req, res) {
    const key = req.params.idOrName.toLowerCase();
    const query = /^\d+$/.test(key) ? { id: Number(key) } : { name: key };
    const p = await Pokemon.findOne(query).lean();
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
}

export async function getSpecies(req, res) {
    const key = req.params.idOrName.toLowerCase();
    const query = /^\d+$/.test(key) ? { id: Number(key) } : { name: key };
    const s = await Species.findOne(query).lean();
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json(s);
}

export async function listAllNames(req, res) {
    // Für Autocomplete: nur Namen + ID
    const docs = await Pokemon.find({}, { _id: 0, id: 1, name: 1 })
        .sort({ id: 1 })
        .lean();
    res.json(docs.map(d => ({ name: d.name, url: `pokemon/${d.id}` })));
}
