const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Parto = sequelize.define('Parto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  servicioId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'servicios', key: 'id' } },
  madreId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  criaId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'animales', key: 'id' } },
  fechaParto: { type: DataTypes.DATEONLY, allowNull: false },
  sexoCria: { type: DataTypes.ENUM('M', 'H'), allowNull: true },
  pesoNacerKg: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  observaciones: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'partos',
  underscored: true,
  timestamps: false,
});

module.exports = Parto;
