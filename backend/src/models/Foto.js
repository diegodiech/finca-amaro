const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Foto = sequelize.define('Foto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  animalId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  url: { type: DataTypes.STRING(255), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  etapa: {
    type: DataTypes.ENUM('nacimiento', '15_dias', '90_dias', '6_meses', '1_anio', 'otro'),
    allowNull: false,
    defaultValue: 'otro',
  },
  notas: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'fotos',
  underscored: true,
  timestamps: false,
});

module.exports = Foto;
