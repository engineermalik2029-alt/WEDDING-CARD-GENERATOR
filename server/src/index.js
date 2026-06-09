import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './lib/database.js';
import cardRoutes from './routes/cardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : '*';

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'premium-wedding-invitation-api' });
});

app.use('/api/uploads', uploadRoutes);
app.use('/api/cards', cardRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Unexpected server error'
  });
});

await connectDatabase();

app.listen(port, () => {
  console.log(`Wedding invitation API running on http://localhost:${port}`);
});