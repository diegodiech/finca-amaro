const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Composición genética de un animal: qué fracción de sangre de cada raza tiene.
// La suma de las fracciones de un mismo animal debería ser 1 (validado en el controlador).
const AnimalRaza = sequelize.define('AnimalRaza', {
  animalId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'animales', key: 'id' } },
  razaId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'razas', key: 'id' } },
  fraccion: { type: DataTypes.DECIMAL(5, 4), allowNull: false },
}, {
  tableName: 'animal_razas',
  underscored: true,
  timestamps: false,
});

module.exports = AnimalRaza;
