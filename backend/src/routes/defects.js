const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT d.*,
      w.surname || ' ' || w.name AS worker_full_name,
      sp.spot_number,
      g.g_num,
      b.brand,
      m.model_name,
      CASE WHEN m.type != 'single' THEN m.type ELSE '' END AS model_type
    FROM defects d
    JOIN worker w ON d.worker_name = w.UniqueID
    JOIN spot sp ON d.spot_id = sp.UniqueID
    JOIN gun g ON d.gun_id = g.UniqueID
    JOIN model m ON sp.model_id = m.UniqueID
    JOIN brand b ON m.brand_id = b.UniqueID
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM defects WHERE UniqueID = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { problem_code, root_cause, solution, df_date, worker_name, spot_id, gun_id } = req.body;
  const result = db.prepare(
    'INSERT INTO defects (problem_code, root_cause, solution, df_date, worker_name, spot_id, gun_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(problem_code, root_cause, solution, df_date, worker_name, spot_id, gun_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM defects WHERE UniqueID = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
