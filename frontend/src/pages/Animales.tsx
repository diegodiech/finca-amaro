import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type {
  Animal, Estado, Potrero, Raza, RazaConFraccion,
} from '../api/types';
import { EstadoPill } from '../components/EstadoPill';

const ESTADOS: Estado[] = ['cria', 'levante', 'servicio', 'prenada', 'lactando', 'engorde', 'reproductor', 'vendido', 'muerto'];

export function Animales() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [razas, setRazas] = useState<Raza[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroQ, setFiltroQ] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargar = () => {
    setCargando(true);
    const params: Record<string, string> = {};
    if (filtroEstado) params.estado = filtroEstado;
    if (filtroQ) params.q = filtroQ;
    api.get<Animal[]>('/animales', { params })
      .then((r) => setAnimales(r.data))
      .catch(() => setError('No pude cargar los animales. ¿Está corriendo el backend?'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    api.get<Potrero[]>('/potreros').then((r) => setPotreros(r.data)).catch(() => {});
    api.get<Raza[]>('/razas').then((r) => setRazas(r.data)).catch(() => {});
  }, []);

  useEffect(cargar, [filtroEstado, filtroQ]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Animales</h1>
          <p className="page-sub">{animales.length} en el hato{filtroEstado ? ` · filtrado por "${filtroEstado}"` : ''}</p>
        </div>
        <button className="btn" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cerrar' : '+ Nuevo animal'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {mostrarForm && (
        <NuevoAnimalForm
          animales={animales}
          potreros={potreros}
          razas={razas}
          onCreado={() => { setMostrarForm(false); cargar(); }}
        />
      )}

      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="field" style={{ minWidth: 180 }}>
          <label>Buscar</label>
          <input placeholder="Arete o nombre" value={filtroQ} onChange={(e) => setFiltroQ(e.target.value)} />
        </div>
        <div className="field" style={{ minWidth: 180 }}>
          <label>Estado</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {cargando && <p className="loading" style={{ padding: 18 }}>Cargando…</p>}
        {!cargando && animales.length === 0 && <p className="empty" style={{ padding: 18 }}>No hay animales que coincidan.</p>}
        {!cargando && animales.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Arete</th><th>Nombre</th><th>Sexo</th><th>Estado</th><th>Potrero</th><th>Peso</th>
              </tr>
            </thead>
            <tbody>
              {animales.map((a) => (
                <tr key={a.id}>
                  <td className="mono"><Link to={`/animales/${a.id}`}>#{a.arete}</Link></td>
                  <td>{a.nombre || '—'}</td>
                  <td>{a.sexo === 'M' ? '♂' : '♀'}</td>
                  <td><EstadoPill estado={a.estado} /></td>
                  <td>{a.potrero?.nombre || '—'}</td>
                  <td className="mono">{a.pesoActual ? `${a.pesoActual} kg` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function NuevoAnimalForm({
  animales, potreros, razas, onCreado,
}: { animales: Animal[]; potreros: Potrero[]; razas: Raza[]; onCreado: () => void }) {
  const [arete, setArete] = useState('');
  const [nombre, setNombre] = useState('');
  const [sexo, setSexo] = useState<'M' | 'H'>('H');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [madreId, setMadreId] = useState('');
  const [padreId, setPadreId] = useState('');
  const [estado, setEstado] = useState<Estado>('cria');
  const [potreroId, setPotreroId] = useState('');
  const [composicion, setComposicion] = useState<RazaConFraccion[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const sugerir = () => {
    if (!madreId && !padreId) return;
    api.get<{ razaId: number; fraccion: number }[]>('/animales/sugerencia-razas', { params: { madreId, padreId } })
      .then((r) => setComposicion(r.data))
      .catch(() => setError('No pude calcular la sugerencia de razas.'));
  };

  const agregarRaza = () => setComposicion((c) => [...c, { razaId: razas.find((r) => r.activa)?.id ?? razas[0]?.id, fraccion: 0 }]);
  const quitarRaza = (i: number) => setComposicion((c) => c.filter((_, idx) => idx !== i));
  const cambiarRaza = (i: number, campo: 'razaId' | 'fraccion', valor: number) => {
    setComposicion((c) => c.map((r, idx) => (idx === i ? { ...r, [campo]: valor } : r)));
  };

  const sumaFracciones = composicion.reduce((s, r) => s + Number(r.fraccion || 0), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arete) { setError('El arete es obligatorio.'); return; }
    setEnviando(true);
    setError('');
    try {
      await api.post('/animales', {
        arete,
        nombre: nombre || null,
        sexo,
        fechaNacimiento: fechaNacimiento || null,
        madreId: madreId || null,
        padreId: padreId || null,
        estado,
        potreroId: potreroId || null,
        razas: composicion.filter((r) => r.razaId && r.fraccion > 0),
      });
      onCreado();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo crear el animal.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="card" style={{ marginBottom: 16 }} onSubmit={submit}>
      <h3 style={{ marginBottom: 14, fontSize: 17 }}>Nuevo animal</h3>
      {error && <div className="error-box">{error}</div>}
      <div className="form-grid">
        <div className="field"><label>Arete *</label><input value={arete} onChange={(e) => setArete(e.target.value)} placeholder="p. ej. 025" /></div>
        <div className="field"><label>Nombre</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
        <div className="field">
          <label>Sexo</label>
          <select value={sexo} onChange={(e) => setSexo(e.target.value as 'M' | 'H')}>
            <option value="H">Hembra</option><option value="M">Macho</option>
          </select>
        </div>
        <div className="field"><label>Fecha de nacimiento</label><input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} /></div>
        <div className="field">
          <label>Madre</label>
          <select value={madreId} onChange={(e) => setMadreId(e.target.value)}>
            <option value="">— sin registrar —</option>
            {animales.filter((a) => a.sexo === 'H').map((a) => <option key={a.id} value={a.id}>#{a.arete} {a.nombre || ''}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Padre</label>
          <select value={padreId} onChange={(e) => setPadreId(e.target.value)}>
            <option value="">— sin registrar —</option>
            {animales.filter((a) => a.sexo === 'M').map((a) => <option key={a.id} value={a.id}>#{a.arete} {a.nombre || ''}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as Estado)}>
            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Potrero</label>
          <select value={potreroId} onChange={(e) => setPotreroId(e.target.value)}>
            <option value="">— sin asignar —</option>
            {potreros.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 11.5, textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600 }}>Composición genética</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn secondary" onClick={sugerir} disabled={!madreId && !padreId}>Sugerir desde padres</button>
            <button type="button" className="btn secondary" onClick={agregarRaza}>+ raza</button>
          </div>
        </div>
        {composicion.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <select value={r.razaId} onChange={(e) => cambiarRaza(i, 'razaId', Number(e.target.value))} style={{ flex: 1, padding: 8, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }}>
              {razas
                .filter((raza) => raza.activa || raza.id === r.razaId)
                .map((raza) => <option key={raza.id} value={raza.id}>{raza.nombre}</option>)}
            </select>
            <input
              type="number" min={0} max={1} step={0.0625} value={r.fraccion}
              onChange={(e) => cambiarRaza(i, 'fraccion', Number(e.target.value))}
              style={{ width: 90, padding: 8, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)' }}
            />
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-muted)', width: 40 }}>{Math.round(r.fraccion * 100)}%</span>
            <button type="button" className="btn secondary" onClick={() => quitarRaza(i)}>×</button>
          </div>
        ))}
        {composicion.length > 0 && (
          <p style={{ fontSize: 12, color: sumaFracciones > 1.001 ? 'var(--bloodline)' : 'var(--ink-muted)', marginTop: 4 }}>
            Suma: {Math.round(sumaFracciones * 100)}% {sumaFracciones > 1.001 ? '— revisá las fracciones, no debería superar 100%.' : ''}
          </p>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar animal'}</button>
      </div>
    </form>
  );
}
