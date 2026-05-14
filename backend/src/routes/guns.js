const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM gun').all());
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM gun WHERE UniqueID = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { g_num, model } = req.body;
  const result = db.prepare('INSERT INTO gun (g_num, model) VALUES (?, ?)').run(g_num, model);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
