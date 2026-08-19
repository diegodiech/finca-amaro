require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida.');
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err.message);
    console.error('¿Corriste "docker compose up -d" y "npm run db:sync"?');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API de Finca Amaro escuchando en http://localhost:${PORT}`);
  });
}

start();
