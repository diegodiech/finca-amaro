import { useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { BrandMark } from './components/BrandMark';
import { Dashboard } from './pages/Dashboard';
import { Animales } from './pages/Animales';
import { AnimalDetalle } from './pages/AnimalDetalle';
import { Corrales } from './pages/Corrales';
import { Lineas } from './pages/Lineas';
import { Login } from './pages/Login';
import { clearToken, getToken } from './api/auth';

export default function App() {
  const [autenticado, setAutenticado] = useState(() => Boolean(getToken()));

  if (!autenticado) return <Login onIngreso={() => setAutenticado(true)} />;

  const salir = () => { clearToken(); setAutenticado(false); };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <BrandMark />
          <div className="brand-name">
            Finca Amaro
            <span>MONTEAGUDO</span>
          </div>
        </div>
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Bitácora</NavLink>
        <NavLink to="/animales" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Animales</NavLink>
        <NavLink to="/corrales" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Corrales</NavLink>
        <NavLink to="/lineas" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Líneas</NavLink>
        <button className="nav-link" style={{ textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', marginTop: 'auto' }} onClick={salir}>
          Cerrar sesión
        </button>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animales" element={<Animales />} />
          <Route path="/animales/:id" element={<AnimalDetalle />} />
          <Route path="/corrales" element={<Corrales />} />
          <Route path="/lineas" element={<Lineas />} />
        </Routes>
      </main>
    </div>
  );
}
