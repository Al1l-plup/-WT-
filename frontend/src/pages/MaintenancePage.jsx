import { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY_FORM = {
  gun_id: '',
  worker_id: '',
  to_date: '',
  first_weld: '',
  second_weld: '',
  third_weld: '',
  first_pressure: '',
  second_pressure: '',
  third_pressure: '',
};

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [guns, setGuns] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.maintenance.list(), api.guns.list(), api.workers.list()])
      .then(([m, g, w]) => {
        setRecords(m);
        setGuns(g);
        setWorkers(w.filter(wk => wk.is_active === 1 || wk.is_active === true));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    api.maintenance.create({
      gun_id: Number(form.gun_id),
      worker_id: Number(form.worker_id),
      to_date: form.to_date,
      first_weld: Number(form.first_weld),
      second_weld: Number(form.second_weld),
      third_weld: Number(form.third_weld),
      first_pressure: Number(form.first_pressure),
      second_pressure: Number(form.second_pressure),
      third_pressure: Number(form.third_pressure),
    })
      .then(() => { setShowModal(false); setForm(EMPTY_FORM); load(); })
      .catch(err => setError(err.message))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Удалить запись ТО?')) return;
    api.maintenance.delete(id).then(load).catch(console.error);
  };

  const q = search.toLowerCase();
  const filtered = records.filter(r =>
    !q ||
    String(r.g_num).includes(q) ||
    r.worker_name?.toLowerCase().includes(q) ||
    r.to_date?.includes(q)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Техническое обслуживание</h1>
          <span className="page-subtitle">Записи ТО сварочных пистолетов</span>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }}>
          + Добавить
        </button>
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Поиск по пистолету, работнику, дате..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">{search ? 'Ничего не найдено' : 'Нет записей'}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Пистолет</th>
                <th>Работник</th>
                <th>Дата ТО</th>
                <th>Сварка 1</th>
                <th>Сварка 2</th>
                <th>Сварка 3</th>
                <th>Давл. 1</th>
                <th>Давл. 2</th>
                <th>Давл. 3</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.UniqueId || r.UniqueID}>
                  <td><strong>№{r.g_num}</strong></td>
                  <td>{r.worker_name}</td>
                  <td>{r.to_date ? r.to_date.slice(0, 10) : '—'}</td>
                  <td>{r.first_weld}</td>
                  <td>{r.second_weld}</td>
                  <td>{r.third_weld}</td>
                  <td>{r.first_pressure}</td>
                  <td>{r.second_pressure}</td>
                  <td>{r.third_pressure}</td>
                  <td>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(r.UniqueId || r.UniqueID)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-title">Добавить запись ТО</div>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Пистолет</label>
                <select className="form-select" required value={form.gun_id}
                  onChange={e => setForm({ ...form, gun_id: e.target.value })}>
                  <option value="">— выбрать —</option>
                  {guns.map(g => (
                    <option key={g.UniqueID} value={g.UniqueID}>№{g.g_num} — {g.model}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Работник</label>
                <select className="form-select" required value={form.worker_id}
                  onChange={e => setForm({ ...form, worker_id: e.target.value })}>
                  <option value="">— выбрать —</option>
                  {workers.map(w => (
                    <option key={w.UniqueID} value={w.UniqueID}>{w.surname} {w.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Дата ТО</label>
                <input className="form-input" type="date" required value={form.to_date}
                  onChange={e => setForm({ ...form, to_date: e.target.value })} />
              </div>
              <div className="form-row">
                {[['first_weld','Сварка 1'],['second_weld','Сварка 2'],['third_weld','Сварка 3']].map(([f, l]) => (
                  <div className="form-group" key={f}>
                    <label className="form-label">{l}</label>
                    <input className="form-input" type="number" required value={form[f]}
                      onChange={e => setForm({ ...form, [f]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div className="form-row">
                {[['first_pressure','Давление 1'],['second_pressure','Давление 2'],['third_pressure','Давление 3']].map(([f, l]) => (
                  <div className="form-group" key={f}>
                    <label className="form-label">{l}</label>
                    <input className="form-input" type="number" required value={form[f]}
                      onChange={e => setForm({ ...form, [f]: e.target.value })} />
                  </div>
                ))}
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
