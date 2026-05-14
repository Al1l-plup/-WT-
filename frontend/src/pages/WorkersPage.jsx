import { useEffect, useState } from 'react';
import { api } from '../api';

const POSITIONS = [
  'начальник участка',
  'старший техник-технолог',
  'техник-технолог',
];

const EMPTY_FORM = {
  surname: '', name: '', father_name: '', position: POSITIONS[0],
  email: '', password: '', start_date: '',
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [endDate, setEndDate] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const load = () => {
    setLoading(true);
    api.workers.list()
      .then(setWorkers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    api.workers.create(form)
      .then(() => { setShowModal(false); setForm(EMPTY_FORM); load(); })
      .catch(console.error)
      .finally(() => setSaving(false));
  };

  const handleDeactivate = (e) => {
    e.preventDefault();
    setDeactivating(true);
    api.workers.deactivate(deactivateTarget.UniqueID, { end_date: endDate })
      .then(() => { setDeactivateTarget(null); setEndDate(''); load(); })
      .catch(console.error)
      .finally(() => setDeactivating(false));
  };

  const isActive = (w) => w.is_active === 1 || w.is_active === true;

  const handleOverlay = (setter) => (e) => {
    if (e.target === e.currentTarget) setter(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Работники</h1>
          <span className="page-subtitle">Персонал сварочного производства</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Добавить
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : workers.length === 0 ? (
          <div className="empty-state">Нет данных</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Должность</th>
                <th>Email</th>
                <th>Дата начала</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.UniqueID}>
                  <td>{w.surname} {w.name}</td>
                  <td>{w.position}</td>
                  <td>{w.email}</td>
                  <td>{w.start_date ? w.start_date.slice(0, 10) : '-'}</td>
                  <td>
                    {isActive(w) ? (
                      <span className="badge badge-green">Активен</span>
                    ) : (
                      <span className="badge badge-red">Уволен</span>
                    )}
                  </td>
                  <td>
                    {isActive(w) && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeactivateTarget(w)}
                      >
                        Деактивировать
                      </button>
                    )}
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
            <div className="modal-title">Добавить работника</div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Фамилия</label>
                <input className="form-input" type="text" required value={form.surname}
                  onChange={(e) => setForm({ ...form, surname: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Имя</label>
                <input className="form-input" type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Отчество</label>
                <input className="form-input" type="text" value={form.father_name}
                  onChange={(e) => setForm({ ...form, father_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Должность</label>
                <select className="form-select" value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}>
                  {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Пароль</label>
                <input className="form-input" type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Дата начала</label>
                <input className="form-input" type="date" required value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
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

      {deactivateTarget && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setDeactivateTarget(null); setEndDate(''); } }}>
          <div className="modal">
            <div className="modal-title">
              Деактивировать работника
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              {deactivateTarget.surname} {deactivateTarget.name}
            </p>
            <form onSubmit={handleDeactivate}>
              <div className="form-group">
                <label className="form-label">Дата увольнения</label>
                <input className="form-input" type="date" required value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setDeactivateTarget(null); setEndDate(''); }}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-danger" disabled={deactivating}>
                  {deactivating ? 'Сохранение...' : 'Подтвердить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
