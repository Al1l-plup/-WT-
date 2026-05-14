const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { gun_id, spot_id, active_only } = req.query;
  let query = `
    SELECT ws.*, sp.spot_number, g.g_num, p.pressure, p.weld_1, p.weld_2
    FROM welding_setup ws
    JOIN spot sp ON ws.spot_id = sp.UniqueID
    JOIN gun g ON ws.gun_id = g.UniqueID
    JOIN parameters p ON ws.parameter_id = p.UniqueID
    WHERE 1=1
  `;
  const params = [];
  if (gun_id) { query += ' AND ws.gun_id = ?'; params.push(gun_id); }
  if (spot_id) { query += ' AND ws.spot_id = ?'; params.push(spot_id); }
  if (active_only === 'true') { query += ' AND ws.is_active = 1'; }
  res.json(db.prepare(query).all(...params));
});

router.post('/', (req, res) => {
  const { comments, start_date, spot_id, gun_id, parameter_id } = req.body;
  const result = db.prepare(
    'INSERT INTO welding_setup (comments, start_date, is_active, spot_id, gun_id, parameter_id) VALUES (?, ?, 1, ?, ?, ?)'
  ).run(comments, start_date, spot_id, gun_id, parameter_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

// Transfer spot to another gun: deactivate old setup, create new
router.post('/transfer', (req, res) => {
  const { old_setup_id, new_gun_id, new_parameter_id, comments, start_date, end_date } = req.body;
  const old = db.prepare('SELECT * FROM welding_setup WHERE UniqueID = ?').get(old_setup_id);
  if (!old) return res.status(404).json({ error: 'Setup not found' });

  const transfer = db.transaction(() => {
    db.prepare('UPDATE welding_setup SET is_active = 0, end_date = ? WHERE UniqueID = ?').run(end_date || start_date, old_setup_id);
    const result = db.prepare(
      'INSERT INTO welding_setup (comments, start_date, is_active, spot_id, gun_id, parameter_id) VALUES (?, ?, 1, ?, ?, ?)'
    ).run(comments, start_date, old.spot_id, new_gun_id, new_parameter_id || old.parameter_id);
    return result.lastInsertRowid;
  });

  res.status(201).json({ id: transfer() });
});

// Assign new parameter to spot (deactivate old, create new)
router.post('/reassign-parameter', (req, res) => {
  const { old_setup_id, new_parameter_id, comments, start_date, end_date } = req.body;
  const old = db.prepare('SELECT * FROM welding_setup WHERE UniqueID = ?').get(old_setup_id);
  if (!old) return res.status(404).json({ error: 'Setup not found' });

  const reassign = db.transaction(() => {
    db.prepare('UPDATE welding_setup SET is_active = 0, end_date = ? WHERE UniqueID = ?').run(end_date || start_date, old_setup_id);
    const result = db.prepare(
      'INSERT INTO welding_setup (comments, start_date, is_active, spot_id, gun_id, parameter_id) VALUES (?, ?, 1, ?, ?, ?)'
    ).run(comments, start_date, old.spot_id, old.gun_id, new_parameter_id);
    return result.lastInsertRowid;
  });

  res.status(201).json({ id: reassign() });
});

module.exports = router;
