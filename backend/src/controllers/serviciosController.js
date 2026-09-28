const {
  Servicio, Animal, Evento, Parto,
} = require('../models');

exports.listar = async (req, res) => {
  const { madreId } = req.query;
  const where = madreId ? { madreId } : {};
  const servicios = await Servicio.findAll({
    where,
    include: [
      { model: Animal, as: 'madre', attributes: ['id', 'arete', 'nombre'] },
      { model: Animal, as: 'padre', attributes: ['id', 'arete', 'nombre'] },
      { model: Parto, as: 'parto', attributes: ['id', 'fechaParto', 'criaId'] },
    ],
    order: [['fechaServicio', 'DESC']],
  });
  res.json(servicios);
};

exports.crear = async (req, res) => {
  const {
    madreId, padreId, semenToro, tipo, fechaServicio,
  } = req.body;
  if (!madreId || !tipo || !fechaServicio) return res.status(400).json({ error: 'Madre, tipo y fecha de servicio son obligatorios.' });

  const servicio = await Servicio.create({
    madreId, padreId, semenToro, tipo, fechaServicio,
  });
  await Animal.update({ estado: 'servicio' }, { where: { id: madreId } });

  const nombrePadre = semenToro || `el padre #${padreId}`;
  await Evento.create({
    animalId: madreId,
    tipo: 'servicio',
    descripcion: `Servicio (${tipo === 'ia' ? 'inseminación artificial' : 'monta natural'}) con ${nombrePadre}`,
    fecha: fechaServicio,
  });

  res.status(201).json(servicio);
};

// Registrar el resultado del diagnóstico de preñez de un servicio existente.
exports.diagnosticar = async (req, res) => {
  const servicio = await Servicio.findByPk(req.params.id);
  if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado.' });

  const { fechaDiagnostico, resultado, fechaProbableParto } = req.body;
  await servicio.update({ fechaDiagnostico, resultado, fechaProbableParto });
  await Animal.update(
    { estado: resultado === 'prenada' ? 'prenada' : 'levante' },
    { where: { id: servicio.madreId } },
  );

  await Evento.create({
    animalId: servicio.madreId,
    tipo: 'diagnostico',
    descripcion: `Diagnóstico de preñez: ${resultado === 'prenada' ? 'positivo' : 'vacía'}`,
    fecha: fechaDiagnostico,
  });

  res.json(servicio);
};
