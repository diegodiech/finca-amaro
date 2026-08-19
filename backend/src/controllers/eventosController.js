const { Evento, Animal } = require('../models');

exports.listar = async (req, res) => {
  const limite = Number(req.query.limite || 30);
  const eventos = await Evento.findAll({
    include: [{ model: Animal, attributes: ['id', 'arete', 'nombre'] }],
    order: [['fecha', 'DESC'], ['id', 'DESC']],
    limit: limite,
  });
  res.json(eventos);
};
