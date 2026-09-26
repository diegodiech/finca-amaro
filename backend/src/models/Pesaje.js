const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pesaje = sequelize.define('Pesaje', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  animalId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  pesoKg: { type: DataTypes.DECIMAL(7, 2), allowNull: false },
  // 'destete' = peso a los ~205 días, el dato base para comparar terneros entre sí.
  tipo: { type: DataTypes.ENUM('rutina', 'nacimiento', 'destete', 'otro'), allowNull: false, defaultValue: 'rutina' },
  // Escala 1 (muy flaca) a 9 (muy gorda); se mide sobre todo al final de la época seca.
  condicionCorporal: { type: DataTypes.DECIMAL(2, 1), allowNull: true },
  notas: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'pesajes',
  underscored: true,
  timestamps: false,
});

module.exports = Pesaje;
