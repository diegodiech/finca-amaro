const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Raza = sequelize.define('Raza', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  origen: { type: DataTypes.ENUM('cebu', 'taurino', 'compuesta', 'criolla'), allowNull: false, defaultValue: 'cebu' },
  // Línea que la finca maneja en esta etapa. Sumar una raza más adelante = activarla acá, sin tocar código.
  activa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'razas',
  underscored: true,
  timestamps: false,
});

module.exports = Raza;
