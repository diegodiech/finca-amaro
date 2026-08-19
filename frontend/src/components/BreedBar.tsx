import type { RazaConFraccion } from '../api/types';

const PALETA = ['var(--pasture)', 'var(--hide)', 'var(--bloodline)', 'var(--pasture-strong)', 'var(--warn)', 'var(--ok)'];

export function BreedBar({ razas }: { razas: RazaConFraccion[] }) {
  if (!razas.length) return <p className="empty" style={{ padding: 0 }}>Composición genética sin registrar.</p>;

  return (
    <div>
      <div className="breed-bar">
        {razas.map((r, i) => (
          <span key={r.nombre} style={{ width: `${r.fraccion * 100}%`, background: PALETA[i % PALETA.length] }} />
        ))}
      </div>
      <div className="breed-legend">
        {razas.map((r, i) => (
          <span key={r.nombre}>
            <span className="swatch" style={{ background: PALETA[i % PALETA.length] }} />
            {r.nombre} {formatearFraccion(r.fraccion)}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatearFraccion(f: number) {
  const porcentaje = Math.round(f * 100);
  return `${porcentaje}%`;
}
