const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pesaje = sequelize.define('Pesaje', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  animalId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  pesoKg: { type: DataTypes.DECIMAL(7, 2), allowNull: false },
  notas: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'pesajes',
  underscored: true,
  timestamps: false,
});

module.exports = Pesaje;
