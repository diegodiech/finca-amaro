import { useState } from 'react';
import { api } from '../api/client';
import { setToken } from '../api/auth';
import { BrandMark } from '../components/BrandMark';

export function Login({ onIngreso }: { onIngreso: () => void }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { password: clave });
      setToken(data.token);
      onIngreso();
    } catch {
      setError('Clave incorrecta.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BrandMark />
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>Finca Amaro</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)', letterSpacing: '.06em' }}>MONTEAGUDO</div>
        </div>
      </div>
      <form onSubmit={entrar} className="card" style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div className="error-box">{error}</div>}
        <div className="field">
          <label>Clave de acceso</label>
          <input type="password" autoFocus value={clave} onChange={(e) => setClave(e.target.value)} />
        </div>
        <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}
