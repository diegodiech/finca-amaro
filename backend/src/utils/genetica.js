// Un animal hereda la mitad de la composición genética de cada padre.
// Si un padre no tiene registrada su composición (raza desconocida o animal no cargado),
// esa mitad queda simplemente sin repartir — no se inventa un dato que no existe.
function calcularComposicion(razasMadre = [], razasPadre = []) {
  const mapa = new Map();
  const acumular = (lista, factor) => {
    for (const r of lista) {
      const actual = mapa.get(r.razaId) || 0;
      mapa.set(r.razaId, actual + r.fraccion * factor);
    }
  };
  acumular(razasMadre, 0.5);
  acumular(razasPadre, 0.5);
  return Array.from(mapa.entries()).map(([razaId, fraccion]) => ({
    razaId,
    fraccion: Number(fraccion.toFixed(4)),
  }));
}

module.exports = { calcularComposicion };
