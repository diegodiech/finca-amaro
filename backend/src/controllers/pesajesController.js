const { Pesaje, Animal, Evento } = require('../models');

exports.listarPorAnimal = async (req, res) => {
  const pesajes = await Pesaje.findAll({ where: { animalId: req.params.animalId }, order: [['fecha', 'ASC']] });
  res.json(pesajes);
};

exports.crear = async (req, res) => {
  const {
    fecha, pesoKg, tipo, condicionCorporal, notas,
  } = req.body;
  if (!fecha || !pesoKg) return res.status(400).json({ error: 'La fecha y el peso son obligatorios.' });
  if (condicionCorporal != null && (condicionCorporal < 1 || condicionCorporal > 9)) {
    return res.status(400).json({ error: 'La condición corporal va de 1 a 9.' });
  }

  const pesaje = await Pesaje.create({
    animalId: req.params.animalId, fecha, pesoKg, tipo, condicionCorporal, notas,
  });
  await Animal.update({ pesoActual: pesoKg }, { where: { id: req.params.animalId } });

  const etiqueta = tipo === 'destete' ? 'Peso al destete' : 'Pesaje';
  const cc = condicionCorporal ? `, condición ${condicionCorporal}/9` : '';
  await Evento.create({
    animalId: req.params.animalId, tipo: 'pesaje', descripcion: `${etiqueta}: ${pesoKg} kg${cc}`, fecha,
  });

  res.status(201).json(pesaje);
};
