const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { brand_id } = req.query;
  const query = brand_id
    ? 'SELECT s.*, b.brand FROM station s JOIN brand b ON s.brand_id = b.UniqueID WHERE s.brand_id = ?'
    : 'SELECT s.*, b.brand FROM station s JOIN brand b ON s.brand_id = b.UniqueID';
  res.json(brand_id ? db.prepare(query).all(brand_id) : db.prepare(query).all());
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT s.*, b.brand FROM station s JOIN brand b ON s.brand_id = b.UniqueID WHERE s.UniqueID = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

module.exports = router;
