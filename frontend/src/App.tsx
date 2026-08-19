import { NavLink, Route, Routes } from 'react-router-dom';
import { BrandMark } from './components/BrandMark';
import { Dashboard } from './pages/Dashboard';
import { Animales } from './pages/Animales';
import { AnimalDetalle } from './pages/AnimalDetalle';
import { Corrales } from './pages/Corrales';

export default function App() {
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
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animales" element={<Animales />} />
          <Route path="/animales/:id" element={<AnimalDetalle />} />
          <Route path="/corrales" element={<Corrales />} />
        </Routes>
      </main>
    </div>
  );
}
