const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Monta natural o inseminación artificial. Si el padre no está registrado como
// animal propio (semen comprado de un toro externo), se guarda el nombre en semenToro.
const Servicio = sequelize.define('Servicio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  madreId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  padreId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'animales', key: 'id' } },
  semenToro: { type: DataTypes.STRING(60), allowNull: true },
  tipo: { type: DataTypes.ENUM('monta_natural', 'ia'), allowNull: false },
  fechaServicio: { type: DataTypes.DATEONLY, allowNull: false },
  fechaDiagnostico: { type: DataTypes.DATEONLY, allowNull: true },
  resultado: { type: DataTypes.ENUM('pendiente', 'prenada', 'vacia'), allowNull: false, defaultValue: 'pendiente' },
  fechaProbableParto: { type: DataTypes.DATEONLY, allowNull: true },
  notas: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'servicios',
  underscored: true,
  timestamps: false,
});

module.exports = Servicio;
