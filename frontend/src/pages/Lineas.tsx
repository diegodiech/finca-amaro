import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Raza } from '../api/types';

const ORIGEN: Record<Raza['origen'], string> = {
  cebu: 'Cebuina', taurino: 'Taurina', compuesta: 'Compuesta', criolla: 'Criolla',
};

export function Lineas() {
  const [razas, setRazas] = useState<Raza[] | null>(null);
  const [error, setError] = useState('');

  const cargar = () => {
    api.get<Raza[]>('/razas').then((r) => setRazas(r.data)).catch(() => setError('No pude cargar las razas.'));
  };
  useEffect(cargar, []);

  const alternar = async (raza: Raza) => {
    await api.patch(`/razas/${raza.id}`, { activa: !raza.activa });
    cargar();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Líneas</h1>
          <p className="page-sub">Las razas que manejás en esta etapa. Sumar una línea nueva es activarla acá.</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}
      {!razas && !error && <p className="loading">Cargando…</p>}

      {razas && (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Raza</th><th>Tipo</th><th>Estado</th><th /></tr></thead>
            <tbody>
              {razas.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.nombre}</td>
                  <td>{ORIGEN[r.origen]}</td>
                  <td>{r.activa ? <span className="pill reproductor">Línea activa</span> : <span className="pill vendido">Sin manejar</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn secondary" onClick={() => alternar(r)}>{r.activa ? 'Desactivar' : 'Activar'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="page-sub" style={{ marginTop: 12 }}>
        Los animales ya registrados conservan su composición genética aunque una raza esté desactivada (por ejemplo, la sangre Angus que entra por inseminación).
      </p>
    </div>
  );
}
