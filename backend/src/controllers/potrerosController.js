const { Potrero, Animal } = require('../models');

exports.listar = async (req, res) => {
  const potreros = await Potrero.findAll({ order: [['nombre', 'ASC']] });
  res.json(potreros);
};

exports.crear = async (req, res) => {
  const { nombre, capacidadHa, notas } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre del potrero es obligatorio.' });
  const potrero = await Potrero.create({ nombre, capacidadHa, notas });
  res.status(201).json(potrero);
};

// Tablero de corrales: animales agrupados por potrero.
exports.tablero = async (req, res) => {
  const potreros = await Potrero.findAll({
    include: [{ model: Animal, as: 'animales', attributes: ['id', 'arete', 'nombre', 'sexo', 'estado'] }],
    order: [['nombre', 'ASC']],
  });
  res.json(potreros);
};
