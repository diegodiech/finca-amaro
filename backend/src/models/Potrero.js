const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Potrero = sequelize.define('Potrero', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  capacidadHa: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
  notas: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'potreros',
  underscored: true,
  timestamps: false,
});

module.exports = Potrero;
