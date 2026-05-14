import { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY_FORM = { transID: '', type: 'AC' };

export default function TransformersPage() {
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.transformers.list()
      .then(setTransformers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    api.transformers.create(form)
      .then(() => { setShowModal(false); setForm(EMPTY_FORM); load(); })
      .catch(console.error)
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Трансформаторы</h1>
          <span className="page-subtitle">Сварочные трансформаторы (AC / DC)</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Добавить
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : transformers.length === 0 ? (
          <div className="empty-state">Нет данных</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>ID трансформатора</th>
                <th>Тип</th>
              </tr>
            </thead>
            <tbody>
              {transformers.map((t) => (
                <tr key={t.UniqueID}>
                  <td>{t.UniqueID}</td>
                  <td>{t.transID}</td>
                  <td>
                    <span className={`badge ${t.type === 'AC' ? 'badge-blue' : 'badge-yellow'}`}>
                      {t.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-title">Добавить трансформатор</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">ID трансформатора</label>
                <input className="form-input" type="text" required value={form.transID}
                  onChange={(e) => setForm({ ...form, transID: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Тип</label>
                <select className="form-select" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="AC">AC</option>
                  <option value="DC">DC</option>
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
