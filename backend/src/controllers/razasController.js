const { Raza } = require('../models');

exports.listar = async (req, res) => {
  const razas = await Raza.findAll({ order: [['nombre', 'ASC']] });
  res.json(razas);
};
