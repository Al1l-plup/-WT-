import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.guns.list(),
      api.workers.list(),
      api.stations.list(),
      api.transformers.list(),
      api.maintenance.list(),
      api.defects.list(),
    ])
      .then(([guns, workers, stations, transformers, maintenance, defects]) => {
        setStats({
          guns: guns.length,
          workers: workers.filter((w) => w.is_active === 1 || w.is_active === true).length,
          stations: stations.length,
          transformers: transformers.length,
          maintenance: maintenance.length,
          defects: defects.length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Пистолеты',         value: stats.guns,         icon: '⚡' },
        { label: 'Активные работники', value: stats.workers,      icon: '▲' },
        { label: 'Станции',            value: stats.stations,     icon: '⊙' },
        { label: 'Трансформаторы',     value: stats.transformers, icon: '⟳' },
        { label: 'Записи ТО',          value: stats.maintenance,  icon: '✦' },
        { label: 'Дефекты',            value: stats.defects,      icon: '●' },
      ]
    : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Обзор</h1>
          <span className="page-subtitle">Сводная статистика производства</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : (
        <div className="stats-grid">
          {cards.map((c) => (
            <div className="stat-card" key={c.label}>
              <div className="stat-icon">{c.icon}</div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
