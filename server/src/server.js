import 'dotenv/config';
import { connectMongo } from './utils/connectMongo.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('Missing MONGO_URI in .env');
        }
        await connectMongo(process.env.MONGO_URI);
        app.listen(PORT, () => {
            console.log(`🚀 API listening on http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error('Startup error:', e);
        process.exit(1);
    }
}

start();
