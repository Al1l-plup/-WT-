const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM worker').all());
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM worker WHERE UniqueID = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { surname, name, father_name, position, email, password, start_date } = req.body;
  const result = db.prepare(
    'INSERT INTO worker (surname, name, father_name, position, email, password, start_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
  ).run(surname, name, father_name, position, email, password, start_date);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.patch('/:id/deactivate', (req, res) => {
  const { end_date } = req.body;
  db.prepare('UPDATE worker SET end_date = ?, is_active = 0 WHERE UniqueID = ?').run(end_date, req.params.id);
  res.json({ success: true });
});

module.exports = router;
