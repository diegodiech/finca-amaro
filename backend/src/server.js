require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

// La base gratis de Aiven se apaga sola tras un tiempo sin uso, igual que el
// servicio gratis de Render. Si los dos estaban dormidos, la primera conexión
// puede tardar más de lo normal en despertar — por eso reintenta antes de rendirse.
async function conectarConReintentos(intentos = 5, esperaMs = 4000) {
  for (let i = 1; i <= intentos; i += 1) {
    try {
      await sequelize.authenticate();
      console.log('Conexión a MySQL establecida.');
      return;
    } catch (err) {
      console.error(`Intento ${i}/${intentos} de conectar a MySQL falló: ${err.message}`);
      if (i === intentos) throw err;
      await new Promise((r) => setTimeout(r, esperaMs));
    }
  }
}

async function start() {
  try {
    await conectarConReintentos();
  } catch (err) {
    console.error('No se pudo conectar a MySQL después de varios intentos.');
    console.error('¿Están bien las variables DB_* y la base sigue existiendo en Aiven?');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API de Finca Amaro escuchando en http://localhost:${PORT}`);
  });
}

start();
