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

// Returns gun + transformer + station info for an active welding_setup on this spot
router.get('/:id/gun-info', (req, res) => {
  const row = db.prepare(`
    SELECT
      ws.UniqueID            AS setup_id,
      g.UniqueID             AS gun_id,
      g.g_num,
      g.model                AS gun_model,
      t.UniqueID             AS transformer_id,
      t.transID,
      t.type                 AS trans_type,
      s.UniqueID             AS station_id,
      s.station_name,
      b.brand,
      sp.spot_number,
      m.model_name,
      m.model_code
    FROM welding_setup ws
    JOIN gun           g   ON ws.gun_id           = g.UniqueID
    JOIN spot          sp  ON ws.spot_id           = sp.UniqueID
    JOIN model         m   ON sp.model_id          = m.UniqueID
    LEFT JOIN gun_transformer_sssignment gta
                           ON gta.gun_id           = g.UniqueID  AND gta.is_active = 1
    LEFT JOIN trans    t   ON gta.transformer_id   = t.UniqueID
    LEFT JOIN transformer_station_assignment tsa
                           ON tsa.transformer_id   = t.UniqueID  AND tsa.is_active = 1
    LEFT JOIN station  s   ON tsa.station_id       = s.UniqueID
    LEFT JOIN brand    b   ON s.brand_id           = b.UniqueID
    WHERE ws.spot_id = ? AND ws.is_active = 1
    LIMIT 1
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Нет активной установки для этой точки' });
  res.json(row);
});

module.exports = router;
