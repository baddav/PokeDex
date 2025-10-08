import mongoose from 'mongoose';

export async function connectMongo(uri) {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
        dbName: process.env.MONGO_DB || 'pokedex'
    });
    console.log('✅ MongoDB connected');
}
