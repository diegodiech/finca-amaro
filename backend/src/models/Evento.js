const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Bitácora general: cada acción importante (parto, servicio, traslado, vacuna, pesaje)
// deja un evento acá. Es lo que alimenta el "muro" de novedades de la finca.
const Evento = sequelize.define('Evento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  animalId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  tipo: {
    type: DataTypes.ENUM('nacimiento', 'servicio', 'diagnostico', 'parto', 'traslado', 'sanidad', 'pesaje', 'foto', 'compra', 'venta', 'muerte'),
    allowNull: false,
  },
  descripcion: { type: DataTypes.STRING(255), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
}, {
  tableName: 'eventos',
  underscored: true,
  timestamps: true,
  updatedAt: false,
});

module.exports = Evento;
