import { Router } from 'express';
import { createAdminToken } from '../utils/auth.js';
import { getExpectedAdminPassword, getTodayKey, isValidAdminLogin } from '../utils/adminPassword.js';

const router = Router();

router.get('/today-key', (_req, res) => {
  res.json({ timezone: process.env.ADMIN_TIMEZONE || 'America/Tijuana', todayKey: getTodayKey() });
});

router.post('/admin', (req, res) => {
  const { username, password } = req.body || {};
  if (!isValidAdminLogin(username, password)) {
    return res.status(401).json({ message: 'Usuario o contrasena dinamica incorrecta.' });
  }

  return res.json({
    token: createAdminToken(),
    user: { username: process.env.ADMIN_USER || 'admin', role: 'admin' },
    expiresIn: '8h'
  });
});

router.get('/password-hint', (_req, res) => {
  const sample = getExpectedAdminPassword(new Date('2026-05-17T12:00:00-07:00'));
  res.json({
    rule: 'admin + fecha en formato AAAAMMDD con zona America/Tijuana',
    sample
  });
});

export default router;
