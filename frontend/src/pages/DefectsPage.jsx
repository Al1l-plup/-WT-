import { useEffect, useState } from 'react';
import { api } from '../api';

function SpotPicker({ spots, value, onChange, onGunInfo }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = query.trim().length > 0
    ? spots.filter(s => String(s.spot_number).includes(query)).slice(0, 30)
    : [];

  const selected = value ? spots.find(s => s.UniqueID === Number(value)) : null;
  const displayValue = open ? query : (selected ? `№${selected.spot_number} — ${selected.model_name}` : '');

  const pick = (s) => {
    onChange(String(s.UniqueID));
    setQuery(`№${s.spot_number} — ${s.model_name}`);
    setOpen(false);
    // загружаем инфо о пистолете
    api.spots.gunInfo(s.UniqueID)
      .then(onGunInfo)
      .catch(() => onGunInfo(null));
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="form-input"
        type="text"
        placeholder="Введите номер точки..."
        value={displayValue}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={e => { setQuery(e.target.value); onChange(''); onGunInfo(null); }}
      />
      {open && query.trim().length > 0 && (
        <div className="spot-dropdown">
          {filtered.length === 0
            ? <div className="spot-hint">Ничего не найдено</div>
            : filtered.map(s => (
              <div key={s.UniqueID} className="spot-option" onMouseDown={() => pick(s)}>
                №{s.spot_number} — {s.model_name} ({s.model_code})
              </div>
            ))
          }
        </div>
      )}
      {open && query.trim().length === 0 && (
        <div className="spot-dropdown">
          <div className="spot-hint">Начните вводить номер точки...</div>
        </div>
      )}
    </div>
  );
}

function GunInfoCard({ info }) {
  if (!info) return null;
  return (
    <div className="gun-info-card">
      <div className="gun-info-title">Пистолет найден автоматически</div>
      <div className="gun-info-grid">
        <div className="gun-info-item">
          <span className="gun-info-label">Номер пистолета</span>
          <span className="gun-info-value">№{info.g_num}</span>
        </div>
        <div className="gun-info-item">
          <span className="gun-info-label">Модель</span>
          <span className="gun-info-value">{info.gun_model}</span>
        </div>
        {info.transID && (
          <div className="gun-info-item">
            <span className="gun-info-label">Трансформатор</span>
            <span className="gun-info-value">
              {info.transID}
              <span className={`badge ${info.trans_type === 'AC' ? 'badge-blue' : 'badge-yellow'}`}
                style={{ marginLeft: 6 }}>{info.trans_type}</span>
            </span>
          </div>
        )}
        {info.station_name && (
          <div className="gun-info-item">
            <span className="gun-info-label">Станция</span>
            <span className="gun-info-value">{info.station_name}</span>
          </div>
        )}
        {info.brand && (
          <div className="gun-info-item">
            <span className="gun-info-label">Участок</span>
            <span className="gun-info-value">{info.brand}</span>
          </div>
        )}
        <div className="gun-info-item">
          <span className="gun-info-label">Модель авто</span>
          <span className="gun-info-value">{info.model_name} ({info.model_code})</span>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  problem_code: '',
  root_cause: '',
  solution: '',
  df_date: '',
  worker_name: '',
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
  const [gunInfo, setGunInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([api.defects.list(), api.workers.list(), api.spots.list(), api.guns.list()])
      .then(([d, w, s, g]) => {
        setDefects(d);
        setWorkers(w.filter(wk => wk.is_active === 1 || wk.is_active === true));
        setSpots(s);
        setGuns(g);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGunInfo = (info) => {
    setGunInfo(info);
    if (info) setForm(f => ({ ...f, gun_id: String(info.gun_id) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.spot_id) { setError('Выберите точку сварки'); return; }
    if (!form.gun_id)  { setError('Пистолет не определён'); return; }
    setSaving(true);
    api.defects.create({
      problem_code: form.problem_code,
      root_cause:   form.root_cause,
      solution:     form.solution,
      df_date:      form.df_date,
      worker_name:  Number(form.worker_name),
      spot_id:      Number(form.spot_id),
      gun_id:       Number(form.gun_id),
    })
      .then(() => { setShowModal(false); setForm(EMPTY_FORM); setGunInfo(null); load(); })
      .catch(err => setError(err.message))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Удалить запись о дефекте?')) return;
    api.defects.delete(id).then(load).catch(console.error);
  };

  const q = search.toLowerCase();
  const filtered = defects.filter(d =>
    !q ||
    d.problem_code?.toLowerCase().includes(q) ||
    d.root_cause?.toLowerCase().includes(q) ||
    d.worker_full_name?.toLowerCase().includes(q) ||
    String(d.spot_number).includes(q) ||
    String(d.g_num).includes(q)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Дефекты</h1>
          <span className="page-subtitle">Записи о дефектах сварки</span>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setGunInfo(null); setForm(EMPTY_FORM); setShowModal(true); }}>
          + Добавить
        </button>
      </div>

      <div className="search-bar">
        <input className="search-input" type="text"
          placeholder="Поиск по коду, причине, работнику, точке, пистолету..."
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
              {filtered.map(d => (
                <tr key={d.UniqueID}>
                  <td><span className="badge badge-red">{d.problem_code}</span></td>
                  <td className="td-truncate">{d.root_cause}</td>
                  <td className="td-truncate">{d.solution}</td>
                  <td>{d.df_date ? d.df_date.slice(0, 10) : '—'}</td>
                  <td>{d.worker_full_name || d.worker_name}</td>
                  <td>{d.spot_number}</td>
                  <td>{d.g_num}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.UniqueID)}>
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
            <div className="modal-title">Добавить дефект</div>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label className="form-label">Точка сварки</label>
                <SpotPicker
                  spots={spots}
                  value={form.spot_id}
                  onChange={v => setForm(f => ({ ...f, spot_id: v }))}
                  onGunInfo={handleGunInfo}
                />
              </div>

              <GunInfoCard info={gunInfo} />

              {/* если пистолет не нашёлся автоматически — ручной выбор */}
              {form.spot_id && !gunInfo && (
                <div className="form-group">
                  <label className="form-label">Пистолет (нет активной установки — выбрать вручную)</label>
                  <select className="form-select" value={form.gun_id}
                    onChange={e => setForm(f => ({ ...f, gun_id: e.target.value }))}>
                    <option value="">— выбрать —</option>
                    {guns.map(g => (
                      <option key={g.UniqueID} value={g.UniqueID}>№{g.g_num} — {g.model}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Код проблемы</label>
                <input className="form-input" type="text" required maxLength={3}
                  value={form.problem_code}
                  onChange={e => setForm(f => ({ ...f, problem_code: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Первопричина</label>
                <textarea className="form-textarea" required value={form.root_cause}
                  onChange={e => setForm(f => ({ ...f, root_cause: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Решение</label>
                <textarea className="form-textarea" required value={form.solution}
                  onChange={e => setForm(f => ({ ...f, solution: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Дата</label>
                <input className="form-input" type="date" required value={form.df_date}
                  onChange={e => setForm(f => ({ ...f, df_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Работник</label>
                <select className="form-select" required value={form.worker_name}
                  onChange={e => setForm(f => ({ ...f, worker_name: e.target.value }))}>
                  <option value="">— выбрать —</option>
                  {workers.map(w => (
                    <option key={w.UniqueID} value={w.UniqueID}>{w.surname} {w.name}</option>
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
