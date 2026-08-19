import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Animal, Evento } from '../api/types';

const DOT_TIPO: Record<string, string> = {
  servicio: 'var(--bloodline)',
  diagnostico: 'var(--bloodline)',
  parto: 'var(--pasture)',
  nacimiento: 'var(--pasture)',
  sanidad: 'var(--hide)',
  traslado: 'var(--hide)',
  pesaje: 'var(--ink-muted)',
  foto: 'var(--ink-muted)',
  venta: 'var(--warn)',
  compra: 'var(--warn)',
  muerte: 'var(--ink-muted)',
};

export function Dashboard() {
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [animales, setAnimales] = useState<Animal[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get<Evento[]>('/eventos?limite=25'), api.get<Animal[]>('/animales')])
      .then(([e, a]) => { setEventos(e.data); setAnimales(a.data); })
      .catch(() => setError('No pude conectarme con la API. ¿Está corriendo el backend en localhost:4000?'));
  }, []);

  const activos = animales?.filter((a) => a.estado !== 'vendido' && a.estado !== 'muerto') ?? [];
  const prenadas = activos.filter((a) => a.estado === 'prenada').length;
  const hembras = activos.filter((a) => a.sexo === 'H').length;
  const machos = activos.filter((a) => a.sexo === 'M').length;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Bitácora</h1>
          <p className="page-sub">Lo último que pasó en la finca.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="stat-row">
        <div className="stat"><div className="n mono">{activos.length}</div><div className="l">Animales activos</div></div>
        <div className="stat"><div className="n mono">{hembras}</div><div className="l">Hembras</div></div>
        <div className="stat"><div className="n mono">{machos}</div><div className="l">Machos</div></div>
        <div className="stat"><div className="n mono">{prenadas}</div><div className="l">Preñadas</div></div>
      </div>

      <div className="card">
        {eventos === null && !error && <p className="loading">Cargando bitácora…</p>}
        {eventos && eventos.length === 0 && <p className="empty">Todavía no hay eventos registrados.</p>}
        {eventos && eventos.length > 0 && (
          <ul className="feed">
            {eventos.map((ev) => (
              <li key={ev.id}>
                <span className="dot" style={{ background: DOT_TIPO[ev.tipo] || 'var(--pasture)' }} />
                <span>
                  {ev.Animal && (
                    <>
                      <Link to={`/animales/${ev.Animal.id}`} style={{ fontWeight: 700, textDecoration: 'none' }}>
                        {ev.Animal.nombre || `#${ev.Animal.arete}`}
                      </Link>
                      {' — '}
                    </>
                  )}
                  {ev.descripcion}
                </span>
                <span className="when mono">{ev.fecha}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
