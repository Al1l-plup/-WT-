require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// в продакшне раздаём собранный фронтенд
const DIST = path.join(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(DIST)) {
  app.use(express.static(DIST));
}

app.use('/api/brands', require('./routes/brands'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/guns', require('./routes/guns'));
app.use('/api/transformers', require('./routes/transformers'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/models', require('./routes/models'));
app.use('/api/spots', require('./routes/spots'));
app.use('/api/parameters', require('./routes/parameters'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/defects', require('./routes/defects'));
app.use('/api/welding-setup', require('./routes/weldingSetup'));
app.use('/api/transformer-assignments', require('./routes/transformerAssignments'));
app.use('/api/gun-assignments', require('./routes/gunAssignments'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// все остальные маршруты → index.html (SPA)
if (process.env.NODE_ENV === 'production' && fs.existsSync(DIST)) {
  app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
