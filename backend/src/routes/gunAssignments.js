const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT gta.*, g.g_num, t.transID
    FROM gun_transformer_sssignment gta
    JOIN gun g ON gta.gun_id = g.UniqueID
    JOIN trans t ON gta.transformer_id = t.UniqueID
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { start_date, comments, gun_id, transformer_id } = req.body;
  const result = db.prepare(
    'INSERT INTO gun_transformer_sssignment (start_date, is_active, comments, gun_id, transformer_id) VALUES (?, 1, ?, ?, ?)'
  ).run(start_date, comments, gun_id, transformer_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
