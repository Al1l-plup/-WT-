import { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY_FORM = { g_num: '', model: '' };

export default function GunsPage() {
  const [guns, setGuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.guns.list()
      .then(setGuns)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    api.guns.create({ g_num: Number(form.g_num), model: form.model })
      .then(() => { setShowModal(false); setForm(EMPTY_FORM); load(); })
      .catch(console.error)
      .finally(() => setSaving(false));
  };

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) setShowModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Пистолеты</h1>
          <span className="page-subtitle">Сварочные пистолеты</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Добавить
        </button>
      </div>

      <div className="search-bar">
        <input className="search-input" type="text" placeholder="Поиск по номеру или модели..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : guns.filter(g => !search || String(g.g_num).includes(search) || g.model.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
          <div className="empty-state">{search ? 'Ничего не найдено' : 'Нет данных'}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Номер</th>
                <th>Модель пистолета</th>
              </tr>
            </thead>
            <tbody>
              {guns.filter(g => !search || String(g.g_num).includes(search) || g.model.toLowerCase().includes(search.toLowerCase())).map((g) => (
                <tr key={g.UniqueID}>
                  <td>{g.UniqueID}</td>
                  <td>{g.g_num}</td>
                  <td>{g.model}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleOverlay}>
          <div className="modal">
            <div className="modal-title">Добавить пистолет</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Номер пистолета</label>
                <input
                  className="form-input"
                  type="number"
                  required
                  value={form.g_num}
                  onChange={(e) => setForm({ ...form, g_num: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Модель</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Отмена
                </button>
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
