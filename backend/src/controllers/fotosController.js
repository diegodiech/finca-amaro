const { Foto, Evento } = require('../models');

exports.listarPorAnimal = async (req, res) => {
  const fotos = await Foto.findAll({ where: { animalId: req.params.animalId }, order: [['fecha', 'ASC']] });
  res.json(fotos);
};

exports.crear = async (req, res) => {
  const {
    url, fecha, etapa, notas,
  } = req.body;
  if (!url || !fecha) return res.status(400).json({ error: 'La url y la fecha de la foto son obligatorias.' });

  const foto = await Foto.create({
    animalId: req.params.animalId, url, fecha, etapa, notas,
  });
  await Evento.create({
    animalId: req.params.animalId, tipo: 'foto', descripcion: 'Nueva foto agregada', fecha,
  });

  res.status(201).json(foto);
};
