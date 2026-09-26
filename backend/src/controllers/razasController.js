const { Raza } = require('../models');

exports.listar = async (req, res) => {
  const razas = await Raza.findAll({ order: [['activa', 'DESC'], ['nombre', 'ASC']] });
  res.json(razas);
};

// Activar o desactivar una línea (etapa 1 = solo Nelore; etapas siguientes suman razas).
exports.actualizar = async (req, res) => {
  const raza = await Raza.findByPk(req.params.id);
  if (!raza) return res.status(404).json({ error: 'Raza no encontrada.' });
  await raza.update({ activa: Boolean(req.body.activa) });
  res.json(raza);
};
