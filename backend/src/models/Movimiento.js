const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Movimiento = sequelize.define('Movimiento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  animalId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  tipo: { type: DataTypes.ENUM('compra', 'venta', 'traslado', 'muerte', 'nacimiento'), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  origenPotreroId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'potreros', key: 'id' } },
  destinoPotreroId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'potreros', key: 'id' } },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  contraparte: { type: DataTypes.STRING(80), allowNull: true },
  notas: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'movimientos',
  underscored: true,
  timestamps: false,
});

module.exports = Movimiento;
