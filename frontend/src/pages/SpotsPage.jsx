import { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY_FORM = { spot_number: '', model_id: '' };

export default function SpotsPage() {
  const [spots, setSpots] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModel, setFilterModel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadSpots = (model_id) => {
    setLoading(true);
    api.spots.list(model_id || undefined)
      .then(setSpots)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.models.list()
      .then(setModels)
      .catch(console.error);
    loadSpots(null);
  }, []);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterModel(val);
    loadSpots(val || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    api.spots.create({ spot_number: form.spot_number, model_id: Number(form.model_id) })
      .then(() => { setShowModal(false); setForm(EMPTY_FORM); loadSpots(filterModel || null); })
      .catch(console.error)
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Точки сварки</h1>
          <span className="page-subtitle">Точки сварки по моделям автомобилей</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Добавить
        </button>
      </div>

      <div className="filters">
        <select className="filter-select" value={filterModel} onChange={handleFilterChange}>
          <option value="">Все модели</option>
          {models.map((m) => (
            <option key={m.UniqueID} value={m.UniqueID}>
              {m.model_name} ({m.model_code}) — {m.brand}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : spots.length === 0 ? (
          <div className="empty-state">Нет данных</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Номер точки</th>
                <th>Модель</th>
                <th>Код модели</th>
              </tr>
            </thead>
            <tbody>
              {spots.map((s, i) => (
                <tr key={s.UniqueID}>
                  <td>{i + 1}</td>
                  <td>{s.spot_number}</td>
                  <td>{s.model_name}</td>
                  <td>{s.model_code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-title">Добавить точку сварки</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Номер точки</label>
                <input className="form-input" type="text" required value={form.spot_number}
                  onChange={(e) => setForm({ ...form, spot_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Модель автомобиля</label>
                <select className="form-select" required value={form.model_id}
                  onChange={(e) => setForm({ ...form, model_id: e.target.value })}>
                  <option value="">— выбрать —</option>
                  {models.map((m) => (
                    <option key={m.UniqueID} value={m.UniqueID}>
                      {m.model_name} ({m.model_code}) — {m.brand}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
