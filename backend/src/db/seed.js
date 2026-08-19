const {
  sequelize, Raza, Potrero, Animal, Servicio, Evento,
} = require('../models');

// Datos de ejemplo: el mismo cruce de cuatro razas del cuaderno de marca,
// para que la app tenga algo real que mostrar desde el primer arranque.
async function main() {
  await sequelize.sync({ alter: true });

  const [angus] = await Raza.findOrCreate({ where: { nombre: 'Angus' }, defaults: { origen: 'taurino' } });
  const [brahman] = await Raza.findOrCreate({ where: { nombre: 'Brahman' }, defaults: { origen: 'cebu' } });
  const [nelore] = await Raza.findOrCreate({ where: { nombre: 'Nelore' }, defaults: { origen: 'cebu' } });
  const [guzerat] = await Raza.findOrCreate({ where: { nombre: 'Guzerat' }, defaults: { origen: 'cebu' } });
  await Raza.findOrCreate({ where: { nombre: 'Gyr' }, defaults: { origen: 'cebu' } });
  await Raza.findOrCreate({ where: { nombre: 'Brangus' }, defaults: { origen: 'compuesta' } });
  await Raza.findOrCreate({ where: { nombre: 'Criollo' }, defaults: { origen: 'criolla' } });

  const potreros = {};
  for (const nombre of ['Maternidad', 'Levante', 'Servicio / IA', 'Preñadas', 'Engorde / Venta']) {
    const [p] = await Potrero.findOrCreate({ where: { nombre } });
    potreros[nombre] = p;
  }

  const trueno = await Animal.create({
    arete: 'IA-TRUENO', nombre: 'Trueno', sexo: 'M', esExterno: true, estado: 'reproductor',
  });
  await trueno.setRazas([angus], { through: { fraccion: 1 } });

  const rayo = await Animal.create({
    arete: 'IA-RAYO', nombre: 'Rayo', sexo: 'M', esExterno: true, estado: 'reproductor',
  });
  await rayo.setRazas([brahman], { through: { fraccion: 1 } });

  const h01 = await Animal.create({
    arete: 'H-01', nombre: 'Amaro H-01', sexo: 'H', estado: 'reproductor',
  });
  await h01.setRazas([nelore], { through: { fraccion: 1 } });

  const amaro001 = await Animal.create({
    arete: '001', nombre: 'Amaro 001', sexo: 'H', estado: 'reproductor',
  });
  await amaro001.setRazas([guzerat], { through: { fraccion: 1 } });

  const t05 = await Animal.create({
    arete: 'T-05', nombre: 'Amaro T-05', sexo: 'M', estado: 'reproductor', madreId: h01.id, padreId: trueno.id,
  });
  await t05.setRazas([angus, nelore], { through: [{ fraccion: 0.5 }, { fraccion: 0.5 }] });

  const amaro003 = await Animal.create({
    arete: '003', nombre: 'Amaro 003', sexo: 'H', estado: 'reproductor', madreId: amaro001.id, padreId: rayo.id,
  });
  await amaro003.setRazas([brahman, guzerat], { through: [{ fraccion: 0.5 }, { fraccion: 0.5 }] });

  const amaro014 = await Animal.create({
    arete: '014',
    nombre: 'Amaro 014',
    sexo: 'H',
    estado: 'prenada',
    madreId: amaro003.id,
    padreId: t05.id,
    fechaNacimiento: '2023-06-21',
    pesoActual: 412,
    potreroId: potreros['Preñadas'].id,
  });
  await amaro014.setRazas(
    [angus, nelore, brahman, guzerat],
    { through: [{ fraccion: 0.25 }, { fraccion: 0.25 }, { fraccion: 0.25 }, { fraccion: 0.25 }] },
  );

  const servicio = await Servicio.create({
    madreId: amaro014.id,
    padreId: trueno.id,
    tipo: 'ia',
    fechaServicio: '2025-06-15',
    fechaDiagnostico: '2025-07-20',
    resultado: 'prenada',
    fechaProbableParto: '2026-03-24',
  });

  await Evento.create({
    animalId: amaro014.id,
    tipo: 'servicio',
    descripcion: 'Servicio por inseminación artificial con Trueno',
    fecha: servicio.fechaServicio,
  });
  await Evento.create({
    animalId: amaro014.id,
    tipo: 'diagnostico',
    descripcion: 'Diagnóstico de preñez: positivo',
    fecha: servicio.fechaDiagnostico,
  });

  // Un puñado más de animales para poblar el tablero de corrales.
  const extras = [
    { arete: '018', nombre: null, sexo: 'H', estado: 'levante', potrero: 'Levante' },
    { arete: '019', nombre: null, sexo: 'H', estado: 'levante', potrero: 'Levante' },
    { arete: '020', nombre: null, sexo: 'M', estado: 'levante', potrero: 'Levante' },
    { arete: '009', nombre: null, sexo: 'H', estado: 'servicio', potrero: 'Servicio / IA' },
    { arete: '015', nombre: null, sexo: 'M', estado: 'engorde', potrero: 'Engorde / Venta' },
  ];
  for (const e of extras) {
    await Animal.create({
      arete: e.arete, nombre: e.nombre, sexo: e.sexo, estado: e.estado, potreroId: potreros[e.potrero].id,
    });
  }

  console.log('Datos de ejemplo cargados.');
  await sequelize.close();
}

main().catch((err) => {
  console.error('Error al cargar los datos de ejemplo:', err.message);
  process.exit(1);
});
