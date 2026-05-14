import { useEffect, useState } from 'react';
import { api } from '../api';

function avg(...vals) {
  const nums = vals.map(Number).filter(n => !isNaN(n) && n !== 0);
  if (nums.length === 0) return null;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

function MeasureGroup({ label, fields, form, onChange }) {
  const [f1, f2, f3] = fields;
  const mean = avg(form[f1], form[f2], form[f3]);

  return (
    <div className="measure-group">
      <div className="measure-group-header">
        <span className="measure-group-label">{label}</span>
        {mean !== null && (
          <span className="measure-avg">
            Среднее: <strong>{mean}</strong>
          </span>
        )}
      </div>
      <div className="form-row">
        {fields.map((f, i) => (
          <div className="form-group" key={f}>
            <label className="form-label">Замер {i + 1}</label>
            <input
              className="form-input"
              type="number"
              required
              min="0"
              value={form[f]}
              onChange={e => onChange(f, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  gun_id: '', worker_id: '', to_date: '',
  first_weld: '', second_weld: '', third_weld: '',
  first_pressure: '', second_pressure: '', third_pressure: '',
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

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    api.maintenance.create({
      gun_id:         Number(form.gun_id),
      worker_id:      Number(form.worker_id),
      to_date:        form.to_date,
      first_weld:     Number(form.first_weld),
      second_weld:    Number(form.second_weld),
      third_weld:     Number(form.third_weld),
      first_pressure: Number(form.first_pressure),
      second_pressure:Number(form.second_pressure),
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

  const weldAvg    = avg(form.first_weld, form.second_weld, form.third_weld);
  const pressAvg   = avg(form.first_pressure, form.second_pressure, form.third_pressure);

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
        <input className="search-input" type="text"
          placeholder="Поиск по пистолету, работнику, дате..."
          value={search} onChange={e => setSearch(e.target.value)} />
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
                <th>Ток 1</th>
                <th>Ток 2</th>
                <th>Ток 3</th>
                <th>Ср. ток</th>
                <th>Давл. 1</th>
                <th>Давл. 2</th>
                <th>Давл. 3</th>
                <th>Ср. давл.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const wa = avg(r.first_weld, r.second_weld, r.third_weld);
                const pa = avg(r.first_pressure, r.second_pressure, r.third_pressure);
                return (
                  <tr key={r.UniqueId || r.UniqueID}>
                    <td><strong>№{r.g_num}</strong></td>
                    <td>{r.worker_name}</td>
                    <td>{r.to_date ? r.to_date.slice(0, 10) : '—'}</td>
                    <td>{r.first_weld}</td>
                    <td>{r.second_weld}</td>
                    <td>{r.third_weld}</td>
                    <td><span className="badge badge-blue">{wa}</span></td>
                    <td>{r.first_pressure}</td>
                    <td>{r.second_pressure}</td>
                    <td>{r.third_pressure}</td>
                    <td><span className="badge badge-blue">{pa}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(r.UniqueId || r.UniqueID)}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
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
                  onChange={e => set('gun_id', e.target.value)}>
                  <option value="">— выбрать —</option>
                  {guns.map(g => (
                    <option key={g.UniqueID} value={g.UniqueID}>№{g.g_num} — {g.model}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Работник</label>
                <select className="form-select" required value={form.worker_id}
                  onChange={e => set('worker_id', e.target.value)}>
                  <option value="">— выбрать —</option>
                  {workers.map(w => (
                    <option key={w.UniqueID} value={w.UniqueID}>{w.surname} {w.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Дата ТО</label>
                <input className="form-input" type="date" required value={form.to_date}
                  onChange={e => set('to_date', e.target.value)} />
              </div>

              <MeasureGroup
                label="Сила тока (А)"
                fields={['first_weld', 'second_weld', 'third_weld']}
                form={form}
                onChange={set}
              />

              <MeasureGroup
                label="Давление (бар)"
                fields={['first_pressure', 'second_pressure', 'third_pressure']}
                form={form}
                onChange={set}
              />

              {(weldAvg !== null || pressAvg !== null) && (
                <div className="avg-summary">
                  {weldAvg   !== null && <div>Средний ток: <strong>{weldAvg} А</strong></div>}
                  {pressAvg  !== null && <div>Среднее давление: <strong>{pressAvg} бар</strong></div>}
                </div>
              )}

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
