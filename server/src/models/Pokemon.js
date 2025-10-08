import mongoose from 'mongoose';

const PokemonSchema = new mongoose.Schema({
    id: { type: Number, unique: true, index: true },
    name: { type: String, index: true },
    height: Number,
    weight: Number,
    abilities: Array,
    types: Array,
    sprites: mongoose.Schema.Types.Mixed
}, { timestamps: true });

PokemonSchema.index({ name: 1 });

export const Pokemon = mongoose.model('Pokemon', PokemonSchema);
