require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
