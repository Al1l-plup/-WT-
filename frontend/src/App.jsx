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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (id) => {
    setPage(id);
    setSidebarOpen(false);
  };

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
      <header className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Меню">
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <span className="mobile-title">WeldTeam</span>
      </header>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-text">WeldTeam</div>
          <div className="logo-sub">Управление производством</div>
        </div>
        <nav className="sidebar-nav">
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={`nav-item${page === p.id ? ' active' : ''}`}
              onClick={() => navigate(p.id)}
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
