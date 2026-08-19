import type { Estado } from '../api/types';

const ETIQUETAS: Record<Estado, string> = {
  cria: 'Cría',
  levante: 'Levante',
  servicio: 'En servicio',
  prenada: 'Preñada',
  lactando: 'Lactando',
  engorde: 'Engorde',
  reproductor: 'Reproductor',
  vendido: 'Vendido',
  muerto: 'Baja',
};

export function EstadoPill({ estado }: { estado: Estado }) {
  return <span className={`pill ${estado}`}>{ETIQUETAS[estado] ?? estado}</span>;
}
