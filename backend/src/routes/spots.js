const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { model_id } = req.query;
  const query = `
    SELECT sp.*, m.model_name, m.model_code
    FROM spot sp JOIN model m ON sp.model_id = m.UniqueID
    ${model_id ? 'WHERE sp.model_id = ?' : ''}
  `;
  res.json(model_id ? db.prepare(query).all(model_id) : db.prepare(query).all());
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT sp.*, m.model_name FROM spot sp JOIN model m ON sp.model_id = m.UniqueID WHERE sp.UniqueID = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { spot_number, model_id } = req.body;
  const result = db.prepare('INSERT INTO spot (spot_number, model_id) VALUES (?, ?)').run(spot_number, model_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
