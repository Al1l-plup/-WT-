const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT tsa.*, t.transID, t.type AS trans_type, s.station_name
    FROM transformer_station_assignment tsa
    JOIN trans t ON tsa.transformer_id = t.UniqueID
    JOIN station s ON tsa.station_id = s.UniqueID
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { start_date, comment, transformer_id, station_id } = req.body;
  const result = db.prepare(
    'INSERT INTO transformer_station_assignment (start_date, is_active, comment, transformer_id, station_id) VALUES (?, 1, ?, ?, ?)'
  ).run(start_date, comment, transformer_id, station_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.patch('/:id', (req, res) => {
  const { end_date, is_active, comment } = req.body;
  db.prepare('UPDATE transformer_station_assignment SET end_date = ?, is_active = ?, comment = ? WHERE UniqueID = ?')
    .run(end_date, is_active, comment, req.params.id);
  res.json({ success: true });
});

module.exports = router;
