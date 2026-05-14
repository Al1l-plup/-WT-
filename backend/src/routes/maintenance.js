const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT m.*, w.surname || ' ' || w.name AS worker_name, g.g_num
    FROM maintenance m
    JOIN worker w ON m.worker_id = w.UniqueID
    JOIN gun g ON m.gun_id = g.UniqueID
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM maintenance WHERE UniqueId = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { first_weld, second_weld, third_weld, first_pressure, second_pressure, third_pressure, to_date, worker_id, gun_id } = req.body;
  const result = db.prepare(
    'INSERT INTO maintenance (first_weld, second_weld, third_weld, first_pressure, second_pressure, third_pressure, to_date, worker_id, gun_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(first_weld, second_weld, third_weld, first_pressure, second_pressure, third_pressure, to_date, worker_id, gun_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM maintenance WHERE UniqueId = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
