const { Movimiento, Animal, Evento } = require('../models');

exports.listarPorAnimal = async (req, res) => {
  const movimientos = await Movimiento.findAll({ where: { animalId: req.params.animalId }, order: [['fecha', 'ASC']] });
  res.json(movimientos);
};

exports.crear = async (req, res) => {
  const {
    tipo, fecha, origenPotreroId, destinoPotreroId, precio, contraparte, notas,
  } = req.body;
  if (!tipo || !fecha) return res.status(400).json({ error: 'El tipo y la fecha son obligatorios.' });

  const movimiento = await Movimiento.create({
    animalId: req.params.animalId, tipo, fecha, origenPotreroId, destinoPotreroId, precio, contraparte, notas,
  });

  if (tipo === 'traslado' && destinoPotreroId) {
    await Animal.update({ potreroId: destinoPotreroId }, { where: { id: req.params.animalId } });
  }
  if (tipo === 'venta' || tipo === 'muerte') {
    await Animal.update({ estado: tipo === 'venta' ? 'vendido' : 'muerto' }, { where: { id: req.params.animalId } });
  }

  const descripciones = {
    compra: 'Compra registrada', venta: 'Venta registrada', traslado: 'Traslado de potrero', muerte: 'Baja por muerte', nacimiento: 'Nacimiento registrado',
  };
  await Evento.create({
    animalId: req.params.animalId, tipo, descripcion: descripciones[tipo] || tipo, fecha,
  });

  res.status(201).json(movimiento);
};
