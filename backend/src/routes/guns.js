const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/guns?brand_id=1  — список пистолетов с данными трансформатора и станции
router.get('/', (req, res) => {
  const { brand_id } = req.query;
  const query = `
    SELECT
      g.UniqueID, g.g_num, g.model,
      t.UniqueID  AS transformer_id,
      t.transID,
      t.type      AS trans_type,
      s.UniqueID  AS station_id,
      s.station_name,
      b.UniqueID  AS brand_id,
      b.brand
    FROM gun g
    LEFT JOIN gun_transformer_assignment gta
           ON gta.gun_id = g.UniqueID AND gta.is_active = 1
    LEFT JOIN trans t      ON gta.transformer_id = t.UniqueID
    LEFT JOIN transformer_station_assignment tsa
           ON tsa.transformer_id = t.UniqueID AND tsa.is_active = 1
    LEFT JOIN station s    ON tsa.station_id = s.UniqueID
    LEFT JOIN brand   b    ON s.brand_id = b.UniqueID
    ${brand_id ? 'WHERE s.brand_id = ?' : ''}
    ORDER BY g.g_num
  `;
  res.json(brand_id ? db.prepare(query).all(brand_id) : db.prepare(query).all());
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT
      g.UniqueID, g.g_num, g.model,
      t.UniqueID  AS transformer_id,
      t.transID,
      t.type      AS trans_type,
      s.UniqueID  AS station_id,
      s.station_name,
      b.UniqueID  AS brand_id,
      b.brand
    FROM gun g
    LEFT JOIN gun_transformer_assignment gta
           ON gta.gun_id = g.UniqueID AND gta.is_active = 1
    LEFT JOIN trans t   ON gta.transformer_id = t.UniqueID
    LEFT JOIN transformer_station_assignment tsa
           ON tsa.transformer_id = t.UniqueID AND tsa.is_active = 1
    LEFT JOIN station s ON tsa.station_id = s.UniqueID
    LEFT JOIN brand   b ON s.brand_id = b.UniqueID
    WHERE g.UniqueID = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { g_num, model } = req.body;
  const result = db.prepare('INSERT INTO gun (g_num, model) VALUES (?, ?)').run(g_num, model);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
