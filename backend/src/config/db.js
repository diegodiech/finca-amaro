const { Sequelize } = require('sequelize');
require('dotenv').config();

// Una base local (Docker) no necesita SSL. Una base en la nube (Aiven y la mayoría
// de los proveedores gratis) sí lo exige. Se activa con DB_SSL=true en el .env,
// sin tocar código cuando cambiás de un lado al otro.
const usarSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: usarSSL
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  }
);

module.exports = sequelize;
