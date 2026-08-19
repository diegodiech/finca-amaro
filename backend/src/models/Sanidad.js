const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sanidad = sequelize.define('Sanidad', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  animalId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  tipo: { type: DataTypes.ENUM('vacuna', 'tratamiento', 'desparasitacion'), allowNull: false },
  producto: { type: DataTypes.STRING(80), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  proximaDosis: { type: DataTypes.DATEONLY, allowNull: true },
  notas: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'sanidad',
  underscored: true,
  timestamps: false,
});

module.exports = Sanidad;
