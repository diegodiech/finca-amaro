const { sequelize } = require('../models');

async function main() {
  await sequelize.authenticate();
  console.log('Conectado a MySQL.');
  await sequelize.sync({ alter: true });
  console.log('Tablas sincronizadas.');
  await sequelize.close();
}

main().catch((err) => {
  console.error('Error al sincronizar la base de datos:', err.message);
  process.exit(1);
});
