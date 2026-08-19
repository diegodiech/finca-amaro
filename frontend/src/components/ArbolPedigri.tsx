import type { NodoPedigri } from '../api/types';

const GEN2_Y = [40, 140, 260, 360];
const GEN1_Y: [number, number] = [(GEN2_Y[0] + GEN2_Y[1]) / 2, (GEN2_Y[2] + GEN2_Y[3]) / 2];
const GEN0_Y = (GEN1_Y[0] + GEN1_Y[1]) / 2;

function Caja({
  x, y, w, h, node, resaltado,
}: { x: number; y: number; w: number; h: number; node: NodoPedigri | null; resaltado?: boolean }) {
  if (!node) {
    return (
      <g>
        <rect x={x} y={y - h / 2} width={w} height={h} rx="4" fill="none" stroke="currentColor" strokeDasharray="3 3" opacity=".4" />
        <text x={x + w / 2} y={y + 4} textAnchor="middle" fontSize="11" fill="currentColor" opacity=".4">sin registrar</text>
      </g>
    );
  }
  const razasTexto = node.razas.length
    ? node.razas.map((r) => `${r.nombre} ${Math.round(r.fraccion * 100)}%`).join(' · ')
    : node.esExterno ? 'raza sin registrar (externo)' : 'raza sin registrar';
  return (
    <g>
      <rect x={x} y={y - h / 2} width={w} height={h} rx="4" fill="none" stroke={resaltado ? 'var(--bloodline)' : 'currentColor'} strokeWidth={resaltado ? 1.6 : 1} />
      <text x={x + w / 2} y={y - 3} textAnchor="middle" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
        {node.nombre || node.arete} {node.sexo === 'M' ? '♂' : '♀'}
      </text>
      <text x={x + w / 2} y={y + 12} textAnchor="middle" fontSize="9.5" opacity=".7">{razasTexto}</text>
    </g>
  );
}

function Linea({
  x1, y1, x2, y2, resaltado,
}: { x1: number; y1: number; x2: number; y2: number; resaltado?: boolean }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={resaltado ? 'var(--bloodline)' : 'currentColor'} strokeWidth={resaltado ? 2.2 : 1.3} opacity={resaltado ? 1 : 0.5} />;
}

export function ArbolPedigri({ raiz }: { raiz: NodoPedigri }) {
  const padre = raiz.padre;
  const madre = raiz.madre;

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox="0 0 720 400" role="img" aria-label={`Árbol genealógico de ${raiz.nombre || raiz.arete}, tres generaciones`} style={{ width: '100%', height: 'auto' }}>
        <Linea x1={200} y1={GEN0_Y} x2={280} y2={GEN1_Y[0]} resaltado />
        <Linea x1={200} y1={GEN0_Y} x2={280} y2={GEN1_Y[1]} />
        {padre && (
          <>
            <Linea x1={450} y1={GEN1_Y[0]} x2={530} y2={GEN2_Y[0]} resaltado />
            <Linea x1={450} y1={GEN1_Y[0]} x2={530} y2={GEN2_Y[1]} />
          </>
        )}
        {madre && (
          <>
            <Linea x1={450} y1={GEN1_Y[1]} x2={530} y2={GEN2_Y[2]} />
            <Linea x1={450} y1={GEN1_Y[1]} x2={530} y2={GEN2_Y[3]} />
          </>
        )}

        <Caja x={10} y={GEN0_Y} w={190} h={50} node={raiz} resaltado />
        <Caja x={280} y={GEN1_Y[0]} w={170} h={46} node={padre} resaltado />
        <Caja x={280} y={GEN1_Y[1]} w={170} h={46} node={madre} />
        <Caja x={530} y={GEN2_Y[0]} w={180} h={40} node={padre?.padre ?? null} resaltado />
        <Caja x={530} y={GEN2_Y[1]} w={180} h={40} node={padre?.madre ?? null} />
        <Caja x={530} y={GEN2_Y[2]} w={180} h={40} node={madre?.padre ?? null} />
        <Caja x={530} y={GEN2_Y[3]} w={180} h={40} node={madre?.madre ?? null} />
      </svg>
      <figcaption style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 10 }}>
        En rojo, la línea paterna directa. Las cajas punteadas son ancestros que todavía no están cargados en el sistema.
      </figcaption>
    </figure>
  );
}
