import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import pokemonRoutes from './routes/pokemonRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: false }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/v1', pokemonRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

export default app;
