import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDb } from './utils/db.js';
import { ensureDefaultEvent } from './utils/seed.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import attendanceRoutes from './routes/attendance.js';
import drawRoutes from './routes/draw.js';

const app = express();
const port = process.env.PORT || 8080;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'Control de asistencia para eventos' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/draw', drawRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

connectDb()
  .then(ensureDefaultEvent)
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor listo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo iniciar la aplicacion', error);
    process.exit(1);
  });
