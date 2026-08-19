const {
  Parto, Animal, Servicio, Raza, Evento,
} = require('../models');
const { calcularComposicion } = require('../utils/genetica');

exports.crear = async (req, res) => {
  const {
    servicioId, madreId, fechaParto, sexoCria, pesoNacerKg, observaciones, criaArete, potreroId,
  } = req.body;
  if (!madreId || !fechaParto || !criaArete) {
    return res.status(400).json({ error: 'La madre, la fecha de parto y el arete de la cría son obligatorios.' });
  }

  const servicio = servicioId ? await Servicio.findByPk(servicioId) : null;
  const padreId = servicio?.padreId || null;

  const cria = await Animal.create({
    arete: criaArete,
    sexo: sexoCria,
    madreId,
    padreId,
    fechaNacimiento: fechaParto,
    estado: 'cria',
    potreroId,
  });

  const cargarRazas = async (id) => {
    if (!id) return [];
    const animal = await Animal.findByPk(id, { include: [{ model: Raza, as: 'razas', through: { attributes: ['fraccion'] } }] });
    return animal ? animal.razas.map((r) => ({ razaId: r.id, fraccion: Number(r.AnimalRaza.fraccion) })) : [];
  };
  const [razasMadre, razasPadre] = await Promise.all([cargarRazas(madreId), cargarRazas(padreId)]);
  const composicion = calcularComposicion(razasMadre, razasPadre);
  if (composicion.length) {
    await cria.setRazas(composicion.map((c) => c.razaId), { through: composicion.map((c) => ({ fraccion: c.fraccion })) });
  }

  const parto = await Parto.create({
    servicioId, madreId, criaId: cria.id, fechaParto, sexoCria, pesoNacerKg, observaciones,
  });

  await Animal.update({ estado: 'lactando' }, { where: { id: madreId } });

  await Evento.create({
    animalId: madreId, tipo: 'parto', descripcion: `Parió: cría #${criaArete}${sexoCria ? ` (${sexoCria === 'M' ? 'macho' : 'hembra'})` : ''}`, fecha: fechaParto,
  });
  await Evento.create({
    animalId: cria.id, tipo: 'nacimiento', descripcion: 'Nació en Finca Amaro', fecha: fechaParto,
  });

  res.status(201).json({ parto, cria: { ...cria.toJSON(), razas: composicion } });
};
