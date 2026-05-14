import { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY_FORM = {
  problem_code: '',
  root_cause: '',
  solution: '',
  df_date: '',
  worker_id: '',
  spot_id: '',
  gun_id: '',
};

export default function DefectsPage() {
  const [defects, setDefects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [spots, setSpots] = useState([]);
  const [guns, setGuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.defects.list(),
      api.workers.list(),
      api.spots.list(),
      api.guns.list(),
    ])
      .then(([d, w, s, g]) => {
        setDefects(d);
        setWorkers(w.filter((wk) => wk.is_active === 1 || wk.is_active === true));
        setSpots(s);
        setGuns(g);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      problem_code: form.problem_code,
      root_cause: form.root_cause,
      solution: form.solution,
      df_date: form.df_date,
      worker_id: Number(form.worker_id),
      spot_id: Number(form.spot_id),
      gun_id: Number(form.gun_id),
    };
    api.defects.create(payload)
      .then(() => { setShowModal(false); setForm(EMPTY_FORM); load(); })
      .catch(console.error)
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Удалить запись о дефекте?')) return;
    api.defects.delete(id)
      .then(load)
      .catch(console.error);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Дефекты</h1>
          <span className="page-subtitle">Записи о дефектах сварки</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Добавить
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : defects.length === 0 ? (
          <div className="empty-state">Нет записей</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Код</th>
                <th>Причина</th>
                <th>Решение</th>
                <th>Дата</th>
                <th>Работник</th>
                <th>Точка №</th>
                <th>Пистолет</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {defects.map((d) => (
                <tr key={d.UniqueID}>
                  <td>{d.problem_code}</td>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.root_cause}
                  </td>
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.solution}
                  </td>
                  <td>{d.df_date ? d.df_date.slice(0, 10) : '-'}</td>
                  <td>{d.worker_full_name || d.worker_name}</td>
                  <td>{d.spot_number}</td>
                  <td>{d.g_num}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(d.UniqueID)}
                    >
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
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-title">Добавить дефект</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Код проблемы</label>
                <input className="form-input" type="text" required value={form.problem_code}
                  onChange={(e) => setForm({ ...form, problem_code: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Первопричина</label>
                <textarea className="form-textarea" required value={form.root_cause}
                  onChange={(e) => setForm({ ...form, root_cause: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Решение</label>
                <textarea className="form-textarea" required value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Дата</label>
                <input className="form-input" type="date" required value={form.df_date}
                  onChange={(e) => setForm({ ...form, df_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Работник</label>
                <select className="form-select" required value={form.worker_id}
                  onChange={(e) => setForm({ ...form, worker_id: e.target.value })}>
                  <option value="">— выбрать —</option>
                  {workers.map((w) => (
                    <option key={w.UniqueID} value={w.UniqueID}>{w.surname} {w.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Точка сварки</label>
                <select className="form-select" required value={form.spot_id}
                  onChange={(e) => setForm({ ...form, spot_id: e.target.value })}>
                  <option value="">— выбрать —</option>
                  {spots.map((s) => (
                    <option key={s.UniqueID} value={s.UniqueID}>
                      №{s.spot_number} — {s.model_name} ({s.model_code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Пистолет</label>
                <select className="form-select" required value={form.gun_id}
                  onChange={(e) => setForm({ ...form, gun_id: e.target.value })}>
                  <option value="">— выбрать —</option>
                  {guns.map((g) => (
                    <option key={g.UniqueID} value={g.UniqueID}>№{g.g_num} — {g.model}</option>
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
