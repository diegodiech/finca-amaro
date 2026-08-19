const { Pesaje, Animal, Evento } = require('../models');

exports.listarPorAnimal = async (req, res) => {
  const pesajes = await Pesaje.findAll({ where: { animalId: req.params.animalId }, order: [['fecha', 'ASC']] });
  res.json(pesajes);
};

exports.crear = async (req, res) => {
  const { fecha, pesoKg, notas } = req.body;
  if (!fecha || !pesoKg) return res.status(400).json({ error: 'La fecha y el peso son obligatorios.' });

  const pesaje = await Pesaje.create({ animalId: req.params.animalId, fecha, pesoKg, notas });
  await Animal.update({ pesoActual: pesoKg }, { where: { id: req.params.animalId } });
  await Evento.create({
    animalId: req.params.animalId, tipo: 'pesaje', descripcion: `Pesaje: ${pesoKg} kg`, fecha,
  });

  res.status(201).json(pesaje);
};
