const sequelize = require('../config/db');
const Raza = require('./Raza');
const Potrero = require('./Potrero');
const Animal = require('./Animal');
const AnimalRaza = require('./AnimalRaza');
const Pesaje = require('./Pesaje');
const Foto = require('./Foto');
const Servicio = require('./Servicio');
const Parto = require('./Parto');
const Sanidad = require('./Sanidad');
const Movimiento = require('./Movimiento');
const Evento = require('./Evento');

// Animal <-> Raza (composición genética, con la fracción de sangre como dato extra)
Animal.belongsToMany(Raza, { through: AnimalRaza, foreignKey: 'animalId', as: 'razas' });
Raza.belongsToMany(Animal, { through: AnimalRaza, foreignKey: 'razaId', as: 'animales' });

// Genealogía: un animal tiene una madre y un padre, que son también animales
Animal.belongsTo(Animal, { as: 'madre', foreignKey: 'madreId' });
Animal.belongsTo(Animal, { as: 'padre', foreignKey: 'padreId' });
Animal.hasMany(Animal, { as: 'crias', foreignKey: 'madreId' });

// Ubicación
Animal.belongsTo(Potrero, { as: 'potrero', foreignKey: 'potreroId' });
Potrero.hasMany(Animal, { as: 'animales', foreignKey: 'potreroId' });

// Historiales por animal
Animal.hasMany(Pesaje, { as: 'pesajes', foreignKey: 'animalId' });
Pesaje.belongsTo(Animal, { foreignKey: 'animalId' });

Animal.hasMany(Foto, { as: 'fotos', foreignKey: 'animalId' });
Foto.belongsTo(Animal, { foreignKey: 'animalId' });

Animal.hasMany(Sanidad, { as: 'sanidad', foreignKey: 'animalId' });
Sanidad.belongsTo(Animal, { foreignKey: 'animalId' });

Animal.hasMany(Evento, { as: 'eventos', foreignKey: 'animalId' });
Evento.belongsTo(Animal, { foreignKey: 'animalId' });

// Reproducción
Animal.hasMany(Servicio, { as: 'serviciosComoMadre', foreignKey: 'madreId' });
Servicio.belongsTo(Animal, { as: 'madre', foreignKey: 'madreId' });
Servicio.belongsTo(Animal, { as: 'padre', foreignKey: 'padreId' });

Servicio.hasOne(Parto, { as: 'parto', foreignKey: 'servicioId' });
Parto.belongsTo(Servicio, { foreignKey: 'servicioId' });
Parto.belongsTo(Animal, { as: 'madre', foreignKey: 'madreId' });
Parto.belongsTo(Animal, { as: 'cria', foreignKey: 'criaId' });

// Inventario / movimientos
Animal.hasMany(Movimiento, { as: 'movimientos', foreignKey: 'animalId' });
Movimiento.belongsTo(Animal, { foreignKey: 'animalId' });
Movimiento.belongsTo(Potrero, { as: 'origen', foreignKey: 'origenPotreroId' });
Movimiento.belongsTo(Potrero, { as: 'destino', foreignKey: 'destinoPotreroId' });

module.exports = {
  sequelize,
  Raza,
  Potrero,
  Animal,
  AnimalRaza,
  Pesaje,
  Foto,
  Servicio,
  Parto,
  Sanidad,
  Movimiento,
  Evento,
};
