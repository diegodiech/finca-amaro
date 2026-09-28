const {
  sequelize, Raza, Potrero, Animal, Servicio, Evento, AnimalRaza,
} = require('../models');
const { fijarComposicion } = require('../utils/genetica');

// Datos de ejemplo de la etapa 1: línea base Nelore, con Angus entrando solo por inseminación.
// Amaro 014 sale de Amaro T-05 (Trueno Angus x H-01 Nelore) y Amaro 003 (Rayo Nelore x 001 Nelore)
// => Nelore 3/4 + Angus 1/4.
async function main() {
  await sequelize.sync({ alter: true });

  const catalogo = [
    { nombre: 'Nelore', origen: 'cebu', activa: true },
    { nombre: 'Angus', origen: 'taurino', activa: false },
    { nombre: 'Brangus', origen: 'compuesta', activa: false },
    { nombre: 'Brahman', origen: 'cebu', activa: false },
    { nombre: 'Guzerat', origen: 'cebu', activa: false },
    { nombre: 'Gyr', origen: 'cebu', activa: false },
    { nombre: 'Criollo', origen: 'criolla', activa: false },
  ];
  const razas = {};
  for (const r of catalogo) {
    const [raza] = await Raza.findOrCreate({ where: { nombre: r.nombre }, defaults: r });
    razas[r.nombre] = raza;
  }

  const potreros = {};
  for (const nombre of ['Maternidad', 'Levante', 'Servicio / IA', 'Preñadas', 'Engorde / Venta']) {
    const [p] = await Potrero.findOrCreate({ where: { nombre } });
    potreros[nombre] = p;
  }

  if (await Animal.findOne({ where: { arete: '014' } })) {
    console.log('Los datos de ejemplo ya estaban cargados.');
    await sequelize.close();
    return;
  }

  // Todo lo que sigue va en una sola transacción: si algo falla a mitad de camino,
  // no queda un animal "huérfano" cargado a medias.
  await sequelize.transaction(async (t) => {
    const nuevo = async (datos, composicion) => {
      const animal = await Animal.create(datos, { transaction: t });
      await fijarComposicion(
        AnimalRaza,
        animal.id,
        composicion.map(([nombre, fraccion]) => ({ razaId: razas[nombre].id, fraccion })),
        t,
      );
      return animal;
    };

    const trueno = await nuevo({ arete: 'IA-TRUENO', nombre: 'Trueno', sexo: 'M', esExterno: true, estado: 'reproductor' }, [['Angus', 1]]);
    const rayo = await nuevo({ arete: 'IA-RAYO', nombre: 'Rayo', sexo: 'M', esExterno: true, estado: 'reproductor' }, [['Nelore', 1]]);
    const h01 = await nuevo({ arete: 'H-01', nombre: 'Amaro H-01', sexo: 'H', estado: 'reproductor' }, [['Nelore', 1]]);
    const amaro001 = await nuevo({ arete: '001', nombre: 'Amaro 001', sexo: 'H', estado: 'reproductor' }, [['Nelore', 1]]);

    const t05 = await nuevo(
      { arete: 'T-05', nombre: 'Amaro T-05', sexo: 'M', estado: 'reproductor', madreId: h01.id, padreId: trueno.id },
      [['Angus', 0.5], ['Nelore', 0.5]],
    );
    const amaro003 = await nuevo(
      { arete: '003', nombre: 'Amaro 003', sexo: 'H', estado: 'reproductor', madreId: amaro001.id, padreId: rayo.id },
      [['Nelore', 1]],
    );
    const amaro014 = await nuevo(
      {
        arete: '014',
        nombre: 'Amaro 014',
        sexo: 'H',
        estado: 'prenada',
        madreId: amaro003.id,
        padreId: t05.id,
        fechaNacimiento: '2023-06-21',
        pesoActual: 412,
        potreroId: potreros['Preñadas'].id,
      },
      [['Nelore', 0.75], ['Angus', 0.25]],
    );

    const servicio = await Servicio.create({
      madreId: amaro014.id,
      padreId: trueno.id,
      tipo: 'ia',
      fechaServicio: '2025-06-15',
      fechaDiagnostico: '2025-07-20',
      resultado: 'prenada',
      fechaProbableParto: '2026-03-24',
    }, { transaction: t });

    await Evento.create({
      animalId: amaro014.id,
      tipo: 'servicio',
      descripcion: 'Servicio por inseminación artificial con Trueno',
      fecha: servicio.fechaServicio,
    }, { transaction: t });
    await Evento.create({
      animalId: amaro014.id,
      tipo: 'diagnostico',
      descripcion: 'Diagnóstico de preñez: positivo',
      fecha: servicio.fechaDiagnostico,
    }, { transaction: t });

    // Un puñado más de animales para poblar el tablero de corrales (Nelore puro, sin genealogía cargada).
    const extras = [
      { arete: '018', sexo: 'H', estado: 'levante', potrero: 'Levante' },
      { arete: '019', sexo: 'H', estado: 'levante', potrero: 'Levante' },
      { arete: '020', sexo: 'M', estado: 'levante', potrero: 'Levante' },
      { arete: '009', sexo: 'H', estado: 'servicio', potrero: 'Servicio / IA' },
      { arete: '015', sexo: 'M', estado: 'engorde', potrero: 'Engorde / Venta' },
    ];
    for (const e of extras) {
      await nuevo(
        { arete: e.arete, sexo: e.sexo, estado: e.estado, potreroId: potreros[e.potrero].id },
        [['Nelore', 1]],
      );
    }
  });

  console.log('Datos de ejemplo cargados.');
  await sequelize.close();
}

main().catch((err) => {
  console.error('Error al cargar los datos de ejemplo:', err.message);
  if (err.errors) err.errors.forEach((e) => console.error(' -', e.message, e.path, e.value));
  process.exit(1);
});
