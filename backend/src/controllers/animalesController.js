const { Op } = require('sequelize');
const {
  Animal, Raza, Potrero, Evento,
} = require('../models');
const { calcularComposicion } = require('../utils/genetica');

const incluirRelaciones = [
  { model: Raza, as: 'razas', through: { attributes: ['fraccion'] } },
  { model: Potrero, as: 'potrero' },
  { model: Animal, as: 'madre', attributes: ['id', 'arete', 'nombre', 'sexo'] },
  { model: Animal, as: 'padre', attributes: ['id', 'arete', 'nombre', 'sexo'] },
];

function serializarRazas(animal) {
  return animal.razas.map((r) => ({ id: r.id, nombre: r.nombre, fraccion: Number(r.AnimalRaza.fraccion) }));
}

exports.listar = async (req, res) => {
  const { potreroId, estado, q } = req.query;
  const where = {};
  if (potreroId) where.potreroId = potreroId;
  if (estado) where.estado = estado;
  if (q) {
    where[Op.or] = [{ arete: { [Op.like]: `%${q}%` } }, { nombre: { [Op.like]: `%${q}%` } }];
  }
  const animales = await Animal.findAll({ where, include: incluirRelaciones, order: [['arete', 'ASC']] });
  res.json(animales.map((a) => ({ ...a.toJSON(), razas: serializarRazas(a) })));
};

exports.obtener = async (req, res) => {
  const animal = await Animal.findByPk(req.params.id, { include: incluirRelaciones });
  if (!animal) return res.status(404).json({ error: 'Animal no encontrado.' });
  res.json({ ...animal.toJSON(), razas: serializarRazas(animal) });
};

exports.crear = async (req, res) => {
  const {
    arete, nombre, sexo, fechaNacimiento, madreId, padreId, estado, potreroId, pesoActual, esExterno, notas, razas,
  } = req.body;

  if (!arete || !sexo) return res.status(400).json({ error: 'El arete y el sexo son obligatorios.' });

  const animal = await Animal.create({
    arete, nombre, sexo, fechaNacimiento, madreId, padreId, estado, potreroId, pesoActual, esExterno, notas,
  });

  if (Array.isArray(razas) && razas.length) {
    await animal.setRazas(
      razas.map((r) => r.razaId),
      { through: razas.map((r) => ({ fraccion: r.fraccion })) },
    );
  }

  await Evento.create({
    animalId: animal.id,
    tipo: 'nacimiento',
    descripcion: `${animal.nombre || `Animal ${animal.arete}`} se registró en el sistema`,
    fecha: fechaNacimiento || new Date().toISOString().slice(0, 10),
  });

  const completo = await Animal.findByPk(animal.id, { include: incluirRelaciones });
  res.status(201).json({ ...completo.toJSON(), razas: serializarRazas(completo) });
};

exports.actualizar = async (req, res) => {
  const animal = await Animal.findByPk(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal no encontrado.' });

  const {
    nombre, sexo, fechaNacimiento, madreId, padreId, estado, potreroId, pesoActual, notas, razas,
  } = req.body;
  await animal.update({
    nombre, sexo, fechaNacimiento, madreId, padreId, estado, potreroId, pesoActual, notas,
  });

  if (Array.isArray(razas)) {
    await animal.setRazas(
      razas.map((r) => r.razaId),
      { through: razas.map((r) => ({ fraccion: r.fraccion })) },
    );
  }

  const completo = await Animal.findByPk(animal.id, { include: incluirRelaciones });
  res.json({ ...completo.toJSON(), razas: serializarRazas(completo) });
};

exports.eliminar = async (req, res) => {
  const animal = await Animal.findByPk(req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal no encontrado.' });
  await animal.destroy();
  res.status(204).send();
};

// Sugiere la composición genética de una cría a partir de sus padres (regla 50/50).
exports.sugerenciaRazas = async (req, res) => {
  const { madreId, padreId } = req.query;
  const cargarRazas = async (id) => {
    if (!id) return [];
    const animal = await Animal.findByPk(id, { include: [{ model: Raza, as: 'razas', through: { attributes: ['fraccion'] } }] });
    if (!animal) return [];
    return animal.razas.map((r) => ({ razaId: r.id, fraccion: Number(r.AnimalRaza.fraccion) }));
  };
  const [razasMadre, razasPadre] = await Promise.all([cargarRazas(madreId), cargarRazas(padreId)]);
  res.json(calcularComposicion(razasMadre, razasPadre));
};

// Árbol genealógico recursivo (madre y padre de cada generación).
async function cargarAncestro(id, generacionesRestantes) {
  if (!id || generacionesRestantes < 0) return null;
  const animal = await Animal.findByPk(id, {
    include: [{ model: Raza, as: 'razas', through: { attributes: ['fraccion'] } }],
  });
  if (!animal) return null;

  const [madre, padre] = generacionesRestantes > 0
    ? await Promise.all([
      cargarAncestro(animal.madreId, generacionesRestantes - 1),
      cargarAncestro(animal.padreId, generacionesRestantes - 1),
    ])
    : [null, null];

  return {
    id: animal.id,
    arete: animal.arete,
    nombre: animal.nombre,
    sexo: animal.sexo,
    esExterno: animal.esExterno,
    razas: animal.razas.map((r) => ({ nombre: r.nombre, fraccion: Number(r.AnimalRaza.fraccion) })),
    madre,
    padre,
  };
}

exports.pedigri = async (req, res) => {
  const generaciones = Number(req.query.generaciones || 3);
  const arbol = await cargarAncestro(req.params.id, generaciones - 1);
  if (!arbol) return res.status(404).json({ error: 'Animal no encontrado.' });
  res.json(arbol);
};
