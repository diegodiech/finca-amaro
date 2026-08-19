import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Potrero } from '../api/types';

export function Corrales() {
  const [potreros, setPotreros] = useState<Potrero[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Potrero[]>('/potreros/tablero')
      .then((r) => setPotreros(r.data))
      .catch(() => setError('No pude cargar el tablero de corrales.'));
  }, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Corrales</h1>
          <p className="page-sub">Dónde está cada animal ahora mismo.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {!potreros && !error && <p className="loading">Cargando…</p>}

      {potreros && (
        <div className="board">
          {potreros.map((p) => (
            <div key={p.id} className="board-col">
              <h4>{p.nombre} · {p.animales?.length ?? 0}</h4>
              {(p.animales ?? []).map((a) => (
                <Link key={a.id} to={`/animales/${a.id}`} className="chip">
                  <span className="tag">#{a.arete}</span>
                  <span className="note">{a.nombre || (a.sexo === 'M' ? 'macho' : 'hembra')} · {a.estado}</span>
                </Link>
              ))}
              {(!p.animales || p.animales.length === 0) && <p className="empty" style={{ padding: 0, fontSize: 12 }}>Vacío</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
