const jwt = require('jsonwebtoken');

// Finca Amaro tiene un solo usuario (vos), así que no hay tabla de usuarios ni
// contraseñas por persona: hay una clave compartida (APP_PASSWORD) y, al acertarla,
// el servidor entrega un JWT firmado que el navegador guarda y reenvía en cada pedido.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Necesitás iniciar sesión.' });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesión inválida o vencida. Iniciá sesión de nuevo.' });
  }
}

module.exports = { requireAuth };
