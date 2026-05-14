import { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import GunsPage from './pages/GunsPage';
import StationsPage from './pages/StationsPage';
import WorkersPage from './pages/WorkersPage';
import MaintenancePage from './pages/MaintenancePage';
import DefectsPage from './pages/DefectsPage';
import TransformersPage from './pages/TransformersPage';
import SpotsPage from './pages/SpotsPage';

const PAGES = [
  { id: 'dashboard',    label: 'Обзор',         icon: '▣' },
  { id: 'guns',         label: 'Пистолеты',      icon: '⚡' },
  { id: 'stations',     label: 'Станции',        icon: '⊙' },
  { id: 'workers',      label: 'Работники',      icon: '▲' },
  { id: 'maintenance',  label: 'ТО',             icon: '✦' },
  { id: 'defects',      label: 'Дефекты',        icon: '●' },
  { id: 'transformers', label: 'Трансформаторы', icon: '⟳' },
  { id: 'spots',        label: 'Точки',          icon: '◉' },
];

function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <Dashboard />;
      case 'guns':         return <GunsPage />;
      case 'stations':     return <StationsPage />;
      case 'workers':      return <WorkersPage />;
      case 'maintenance':  return <MaintenancePage />;
      case 'defects':      return <DefectsPage />;
      case 'transformers': return <TransformersPage />;
      case 'spots':        return <SpotsPage />;
      default:             return <Dashboard />;
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">WeldTeam</div>
          <div className="logo-sub">Управление производством</div>
        </div>
        <nav className="sidebar-nav">
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={`nav-item${page === p.id ? ' active' : ''}`}
              onClick={() => setPage(p.id)}
            >
              <i className="nav-icon">{p.icon}</i>
              {p.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">Chery · GWM · Changan</div>
      </aside>
      <main className="content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
