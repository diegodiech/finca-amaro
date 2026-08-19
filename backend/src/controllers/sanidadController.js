const { Sanidad, Evento } = require('../models');

exports.listarPorAnimal = async (req, res) => {
  const registros = await Sanidad.findAll({ where: { animalId: req.params.animalId }, order: [['fecha', 'ASC']] });
  res.json(registros);
};

exports.crear = async (req, res) => {
  const {
    tipo, producto, fecha, proximaDosis, notas,
  } = req.body;
  if (!tipo || !producto || !fecha) return res.status(400).json({ error: 'Tipo, producto y fecha son obligatorios.' });

  const registro = await Sanidad.create({
    animalId: req.params.animalId, tipo, producto, fecha, proximaDosis, notas,
  });
  await Evento.create({
    animalId: req.params.animalId, tipo: 'sanidad', descripcion: `${tipo}: ${producto}`, fecha,
  });

  res.status(201).json(registro);
};
