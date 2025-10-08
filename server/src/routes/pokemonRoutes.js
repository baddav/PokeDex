import { Router } from 'express';
import { listPokemon, getPokemon, getSpecies, listAllNames } from '../controllers/pokemonController.js';

const router = Router();

// GET /api/v1/pokemon?limit=20&offset=0[&q=...]
router.get('/pokemon', listPokemon);

// GET /api/v1/pokemon/:idOrName
router.get('/pokemon/:idOrName', getPokemon);

// GET /api/v1/pokemon-species/:idOrName
router.get('/pokemon-species/:idOrName', getSpecies);

// GET /api/v1/names (für Autocomplete)
router.get('/names', listAllNames);

export default router;
