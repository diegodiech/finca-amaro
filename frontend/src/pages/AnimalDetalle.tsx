import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type {
  Animal, Foto, Movimiento, NodoPedigri, Pesaje, Sanidad, Servicio,
} from '../api/types';
import { EstadoPill } from '../components/EstadoPill';
import { BreedBar } from '../components/BreedBar';
import { ArbolPedigri } from '../components/ArbolPedigri';

type Tab = 'ficha' | 'arbol' | 'fotos' | 'pesajes' | 'sanidad' | 'reproduccion' | 'movimientos';

export function AnimalDetalle() {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [tab, setTab] = useState<Tab>('ficha');
  const [error, setError] = useState('');

  const cargarAnimal = () => {
    api.get<Animal>(`/animales/${id}`).then((r) => setAnimal(r.data)).catch(() => setError('No pude cargar este animal.'));
  };

  useEffect(cargarAnimal, [id]);

  if (error) return <div className="error-box">{error}</div>;
  if (!animal) return <p className="loading">Cargando…</p>;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{animal.nombre || `Animal #${animal.arete}`}</h1>
          <p className="page-sub mono">#{animal.arete} · {animal.sexo === 'M' ? 'macho' : 'hembra'}{animal.esExterno ? ' · reproductor externo' : ''}</p>
        </div>
        <EstadoPill estado={animal.estado} />
      </div>

      <div className="tabs">
        {(['ficha', 'arbol', 'fotos', 'pesajes', 'sanidad', 'reproduccion', 'movimientos'] as Tab[]).map((t) => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {ETIQUETAS_TAB[t]}
          </button>
        ))}
      </div>

      {tab === 'ficha' && <Ficha animal={animal} />}
      {tab === 'arbol' && <Arbol animalId={animal.id} />}
      {tab === 'fotos' && <Fotos animalId={animal.id} />}
      {tab === 'pesajes' && <Pesajes animalId={animal.id} onGuardado={cargarAnimal} />}
      {tab === 'sanidad' && <SanidadTab animalId={animal.id} />}
      {tab === 'reproduccion' && <Reproduccion animal={animal} onCambio={cargarAnimal} />}
      {tab === 'movimientos' && <MovimientosTab animalId={animal.id} onCambio={cargarAnimal} />}
    </div>
  );
}

const ETIQUETAS_TAB: Record<Tab, string> = {
  ficha: 'Ficha', arbol: 'Árbol de sangre', fotos: 'Fotos', pesajes: 'Pesajes', sanidad: 'Sanidad', reproduccion: 'Reproducción', movimientos: 'Movimientos',
};

function Ficha({ animal }: { animal: Animal }) {
  return (
    <div className="card">
      <div className="form-grid" style={{ marginBottom: 18 }}>
        <Dato label="Nacimiento" valor={animal.fechaNacimiento || '—'} />
        <Dato label="Peso actual" valor={animal.pesoActual ? `${animal.pesoActual} kg` : '—'} />
        <Dato label="Madre" valor={animal.madre ? `#${animal.madre.arete} ${animal.madre.nombre || ''}` : '—'} />
        <Dato label="Padre" valor={animal.padre ? `#${animal.padre.arete} ${animal.padre.nombre || ''}` : '—'} />
        <Dato label="Potrero" valor={animal.potrero?.nombre || '—'} />
        <Dato label="Notas" valor={animal.notas || '—'} />
      </div>
      <label style={{ fontSize: 11.5, textTransform: 'uppercase', color: 'var(--ink-muted)', fontWeight: 600 }}>Composición genética</label>
      <div style={{ marginTop: 8 }}><BreedBar razas={animal.razas} /></div>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: '.04em' }}>{label}</div>
      <div className="mono" style={{ marginTop: 2 }}>{valor}</div>
    </div>
  );
}

function Arbol({ animalId }: { animalId: number }) {
  const [raiz, setRaiz] = useState<NodoPedigri | null>(null);
  useEffect(() => { api.get<NodoPedigri>(`/animales/${animalId}/pedigri?generaciones=3`).then((r) => setRaiz(r.data)); }, [animalId]);
  if (!raiz) return <p className="loading">Cargando árbol…</p>;
  return <div className="card"><ArbolPedigri raiz={raiz} /></div>;
}

function Fotos({ animalId }: { animalId: number }) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [url, setUrl] = useState('');
  const [fecha, setFecha] = useState('');
  const [etapa, setEtapa] = useState('otro');

  const cargar = () => api.get<Foto[]>(`/animales/${animalId}/fotos`).then((r) => setFotos(r.data));
  useEffect(() => { cargar(); }, [animalId]);

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !fecha) return;
    await api.post(`/animales/${animalId}/fotos`, { url, fecha, etapa });
    setUrl(''); setFecha('');
    cargar();
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {fotos.map((f) => (
          <div key={f.id} style={{ flex: 'none', width: 110 }}>
            <img src={f.url} alt={f.etapa} style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>{f.fecha}</div>
          </div>
        ))}
        {fotos.length === 0 && <p className="empty">Todavía no hay fotos cargadas.</p>}
      </div>
      <form onSubmit={agregar} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: 1, minWidth: 200 }}><label>URL de la foto</label><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></div>
        <div className="field"><label>Fecha</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
        <div className="field">
          <label>Hito</label>
          <select value={etapa} onChange={(e) => setEtapa(e.target.value)}>
            <option value="nacimiento">Nacimiento</option><option value="15_dias">15 días</option>
            <option value="90_dias">90 días</option><option value="6_meses">6 meses</option>
            <option value="1_anio">1 año</option><option value="otro">Otro</option>
          </select>
        </div>
        <button className="btn" type="submit">+ Agregar foto</button>
      </form>
    </div>
  );
}

function Pesajes({ animalId, onGuardado }: { animalId: number; onGuardado: () => void }) {
  const [pesajes, setPesajes] = useState<Pesaje[]>([]);
  const [fecha, setFecha] = useState('');
  const [pesoKg, setPesoKg] = useState('');
  const [tipo, setTipo] = useState<Pesaje['tipo']>('rutina');
  const [condicion, setCondicion] = useState('');

  const cargar = () => api.get<Pesaje[]>(`/animales/${animalId}/pesajes`).then((r) => setPesajes(r.data));
  useEffect(() => { cargar(); }, [animalId]);

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha || !pesoKg) return;
    await api.post(`/animales/${animalId}/pesajes`, {
      fecha, pesoKg: Number(pesoKg), tipo, condicionCorporal: condicion ? Number(condicion) : null,
    });
    setFecha(''); setPesoKg(''); setCondicion(''); setTipo('rutina');
    cargar(); onGuardado();
  };

  return (
    <div className="card">
      <table className="table" style={{ marginBottom: 16 }}>
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Peso</th><th>Condición (1-9)</th></tr></thead>
        <tbody>
          {pesajes.map((p) => (
            <tr key={p.id}>
              <td className="mono">{p.fecha}</td>
              <td>{p.tipo}</td>
              <td className="mono">{p.pesoKg} kg</td>
              <td className="mono">{p.condicionCorporal ?? '—'}</td>
            </tr>
          ))}
          {pesajes.length === 0 && <tr><td colSpan={4} className="empty">Sin pesajes registrados.</td></tr>}
        </tbody>
      </table>
      <form onSubmit={agregar} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="field"><label>Fecha</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
        <div className="field">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as Pesaje['tipo'])}>
            <option value="rutina">Rutina</option><option value="nacimiento">Nacimiento</option>
            <option value="destete">Destete (~205 días)</option><option value="otro">Otro</option>
          </select>
        </div>
        <div className="field"><label>Peso (kg)</label><input type="number" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} /></div>
        <div className="field"><label>Condición (1-9)</label><input type="number" min={1} max={9} step={0.5} value={condicion} onChange={(e) => setCondicion(e.target.value)} /></div>
        <button className="btn" type="submit">+ Registrar</button>
      </form>
    </div>
  );
}

function SanidadTab({ animalId }: { animalId: number }) {
  const [registros, setRegistros] = useState<Sanidad[]>([]);
  const [tipo, setTipo] = useState<'vacuna' | 'tratamiento' | 'desparasitacion'>('vacuna');
  const [producto, setProducto] = useState('');
  const [fecha, setFecha] = useState('');

  const cargar = () => api.get<Sanidad[]>(`/animales/${animalId}/sanidad`).then((r) => setRegistros(r.data));
  useEffect(() => { cargar(); }, [animalId]);

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producto || !fecha) return;
    await api.post(`/animales/${animalId}/sanidad`, { tipo, producto, fecha });
    setProducto(''); setFecha('');
    cargar();
  };

  return (
    <div className="card">
      <table className="table" style={{ marginBottom: 16 }}>
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th></tr></thead>
        <tbody>
          {registros.map((s) => <tr key={s.id}><td className="mono">{s.fecha}</td><td>{s.tipo}</td><td>{s.producto}</td></tr>)}
          {registros.length === 0 && <tr><td colSpan={3} className="empty">Sin registros sanitarios.</td></tr>}
        </tbody>
      </table>
      <form onSubmit={agregar} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div className="field">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
            <option value="vacuna">Vacuna</option><option value="tratamiento">Tratamiento</option><option value="desparasitacion">Desparasitación</option>
          </select>
        </div>
        <div className="field"><label>Producto</label><input value={producto} onChange={(e) => setProducto(e.target.value)} /></div>
        <div className="field"><label>Fecha</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
        <button className="btn" type="submit">+ Registrar</button>
      </form>
    </div>
  );
}

function Reproduccion({ animal, onCambio }: { animal: Animal; onCambio: () => void }) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [tipo, setTipo] = useState<'monta_natural' | 'ia'>('ia');
  const [semenToro, setSemenToro] = useState('');
  const [fechaServicio, setFechaServicio] = useState('');

  const cargar = () => api.get<Servicio[]>('/servicios', { params: { madreId: animal.id } }).then((r) => setServicios(r.data));
  useEffect(() => { cargar(); }, [animal.id]);

  const registrarServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaServicio) return;
    await api.post('/servicios', {
      madreId: animal.id, tipo, semenToro: semenToro || null, fechaServicio,
    });
    setSemenToro(''); setFechaServicio('');
    cargar(); onCambio();
  };

  const diagnosticar = async (servicioId: number, resultado: 'prenada' | 'vacia') => {
    const fechaDiagnostico = new Date().toISOString().slice(0, 10);
    let fechaProbableParto: string | null = null;
    if (resultado === 'prenada') {
      const d = new Date();
      d.setDate(d.getDate() + 283); // gestación bovina promedio
      fechaProbableParto = d.toISOString().slice(0, 10);
    }
    await api.put(`/servicios/${servicioId}/diagnostico`, { fechaDiagnostico, resultado, fechaProbableParto });
    cargar(); onCambio();
  };

  if (animal.sexo !== 'H') return <p className="empty">La reproducción se registra desde la ficha de la hembra.</p>;

  return (
    <div className="card">
      <table className="table" style={{ marginBottom: 16 }}>
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Padre</th><th>Resultado</th><th>Parto probable</th><th /></tr></thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id}>
              <td className="mono">{s.fechaServicio}</td>
              <td>{s.tipo === 'ia' ? 'IA' : 'Monta natural'}</td>
              <td>{s.padre ? `#${s.padre.arete}` : s.semenToro || '—'}</td>
              <td>{s.resultado}</td>
              <td className="mono">{s.fechaProbableParto || '—'}</td>
              <td>
                {s.resultado === 'pendiente' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn secondary" onClick={() => diagnosticar(s.id, 'prenada')}>Preñada</button>
                    <button className="btn secondary" onClick={() => diagnosticar(s.id, 'vacia')}>Vacía</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {servicios.length === 0 && <tr><td colSpan={6} className="empty">Sin servicios registrados.</td></tr>}
        </tbody>
      </table>
      <form onSubmit={registrarServicio} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="field">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
            <option value="ia">Inseminación artificial</option><option value="monta_natural">Monta natural</option>
          </select>
        </div>
        <div className="field"><label>Toro / semen</label><input value={semenToro} onChange={(e) => setSemenToro(e.target.value)} placeholder="Nombre del toro" /></div>
        <div className="field"><label>Fecha</label><input type="date" value={fechaServicio} onChange={(e) => setFechaServicio(e.target.value)} /></div>
        <button className="btn" type="submit">+ Registrar servicio</button>
      </form>
    </div>
  );
}

function MovimientosTab({ animalId, onCambio }: { animalId: number; onCambio: () => void }) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [tipo, setTipo] = useState<Movimiento['tipo']>('traslado');
  const [fecha, setFecha] = useState('');
  const [notas, setNotas] = useState('');

  const cargar = () => api.get<Movimiento[]>(`/animales/${animalId}/movimientos`).then((r) => setMovimientos(r.data));
  useEffect(() => { cargar(); }, [animalId]);

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha) return;
    await api.post(`/animales/${animalId}/movimientos`, { tipo, fecha, notas: notas || null });
    setFecha(''); setNotas('');
    cargar(); onCambio();
  };

  return (
    <div className="card">
      <table className="table" style={{ marginBottom: 16 }}>
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Notas</th></tr></thead>
        <tbody>
          {movimientos.map((m) => <tr key={m.id}><td className="mono">{m.fecha}</td><td>{m.tipo}</td><td>{m.notas || '—'}</td></tr>)}
          {movimientos.length === 0 && <tr><td colSpan={3} className="empty">Sin movimientos registrados.</td></tr>}
        </tbody>
      </table>
      <form onSubmit={agregar} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div className="field">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
            <option value="traslado">Traslado</option><option value="compra">Compra</option>
            <option value="venta">Venta</option><option value="muerte">Muerte</option>
          </select>
        </div>
        <div className="field"><label>Fecha</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
        <div className="field" style={{ flex: 1 }}><label>Notas</label><input value={notas} onChange={(e) => setNotas(e.target.value)} /></div>
        <button className="btn" type="submit">+ Registrar</button>
      </form>
    </div>
  );
}
