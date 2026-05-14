const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM parameters').all());
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM parameters WHERE UniqueID = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { pressure, squeeze_time, up_slope_time, weld_1, heat_1, cool_1, weld_2, heat_2, hold, turn_R } = req.body;
  const result = db.prepare(
    'INSERT INTO parameters (pressure, squeeze_time, up_slope_time, weld_1, heat_1, cool_1, weld_2, heat_2, hold, turn_R) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(pressure, squeeze_time, up_slope_time, weld_1, heat_1, cool_1, weld_2, heat_2, hold, turn_R);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
