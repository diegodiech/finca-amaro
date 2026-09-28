const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const authController = require('./controllers/authController');
const { requireAuth } = require('./middleware/auth');

const app = express();

// En producción solo el sitio real puede llamar a la API. En desarrollo (sin
// CORS_ORIGIN configurado) queda abierto para no trabar el localhost.
const origenesPermitidos = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
app.use(cors(origenesPermitidos ? { origin: origenesPermitidos } : {}));
app.use(express.json());

// Público: Render usa esto para saber que el servicio sigue vivo, y es el paso previo al login.
app.get('/api/salud', (req, res) => res.json({ ok: true, finca: 'Amaro' }));
app.post('/api/auth/login', authController.login);

// Todo lo demás pide la clave de la finca.
app.use('/api', requireAuth, routes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno del servidor.' });
});

module.exports = app;
