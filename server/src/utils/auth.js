import jwt from 'jsonwebtoken';

const TOKEN_TTL = '8h';

export function createAdminToken() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Falta JWT_SECRET.');
  }

  return jwt.sign({ role: 'admin' }, secret, { expiresIn: TOKEN_TTL });
}

export function requireAdmin(req, res, next) {
  const secret = process.env.JWT_SECRET;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!secret || !token) {
    return res.status(401).json({ message: 'Sesion de administrador requerida.' });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Permisos insuficientes.' });
    }
    req.admin = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Sesion expirada o invalida.' });
  }
}
