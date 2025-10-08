import mongoose from 'mongoose';

const SpeciesSchema = new mongoose.Schema({
    id: { type: Number, unique: true, index: true },
    name: { type: String, index: true },
    genera: Array,
    flavor_text_entries: Array,
    names: Array
}, { timestamps: true });

SpeciesSchema.index({ name: 1 });

export const Species = mongoose.model('Species', SpeciesSchema);
