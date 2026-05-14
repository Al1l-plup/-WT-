import { useEffect, useState } from 'react';
import { api } from '../api';

const BRAND_TABS = [
  { id: null, label: 'Все' },
  { id: 1,    label: 'Chery' },
  { id: 2,    label: 'GWM' },
  { id: 3,    label: 'Changan' },
];

const BRAND_BADGE = {
  Chery:   'badge-blue',
  GWM:     'badge-green',
  Changan: 'badge-yellow',
};

export default function StationsPage() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState(null);

  const load = (brand_id) => {
    setLoading(true);
    api.stations.list(brand_id)
      .then(setStations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(null); }, []);

  const handleTab = (id) => {
    setActiveBrand(id);
    load(id);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Станции</h1>
          <span className="page-subtitle">Сварочные станции по брендам</span>
        </div>
      </div>

      <div className="brand-tabs">
        {BRAND_TABS.map((t) => (
          <button
            key={String(t.id)}
            className={`brand-tab${activeBrand === t.id ? ' active' : ''}`}
            onClick={() => handleTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : stations.length === 0 ? (
          <div className="empty-state">Нет данных</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Станция</th>
                <th>Бренд</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.UniqueID}>
                  <td>{s.UniqueID}</td>
                  <td>{s.station_name}</td>
                  <td>
                    <span className={`badge ${BRAND_BADGE[s.brand] || 'badge-gray'}`}>
                      {s.brand}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
