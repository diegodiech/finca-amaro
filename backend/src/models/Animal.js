const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Animal = sequelize.define('Animal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  arete: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(60), allowNull: true },
  sexo: { type: DataTypes.ENUM('M', 'H'), allowNull: false },
  fechaNacimiento: { type: DataTypes.DATEONLY, allowNull: true },
  madreId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'animales', key: 'id' } },
  padreId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'animales', key: 'id' } },
  estado: {
    type: DataTypes.ENUM('cria', 'levante', 'servicio', 'prenada', 'lactando', 'engorde', 'reproductor', 'vendido', 'muerto'),
    allowNull: false,
    defaultValue: 'cria',
  },
  potreroId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'potreros', key: 'id' } },
  pesoActual: { type: DataTypes.DECIMAL(7, 2), allowNull: true },
  fotoPerfilUrl: { type: DataTypes.STRING(255), allowNull: true },
  esExterno: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'true = reproductor de otra finca (p.ej. toro de IA) que no vive en Finca Amaro pero sí aporta genética',
  },
  notas: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'animales',
  underscored: true,
  timestamps: true,
});

module.exports = Animal;
