const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const { pool, ensureUploadsTable } = require('./ensureUploadsTable');

const app = express();
const port = process.env.PORT || 3002;

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.send('Backend B is Running!');
});

// Connectivity test for Backend B
app.get('/api/b', async (req, res) => {
  try {
    const client = await pool.connect();
    const query = `
      INSERT INTO requests (backend_name, ts, meta) 
      VALUES ($1, NOW(), $2) 
      RETURNING *;
    `;
    const values = ['backend-b', { uploaded: false }];
    const result = await client.query(query, values);
    client.release();

    res.json({
      backend: 'backend-b',
      message: 'Hello from Backend B',
      db_entry: result.rows[0],
    });
  } catch (err) {
    console.error('Backend B /api/b error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Upload route for Backend B
app.post('/api/b/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const query = `
      INSERT INTO uploads (backend_name, file_name, file_size, mime_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      process.env.BACKEND_NAME || 'backend-b',
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
    ];

    const dbRes = await pool.query(query, values);

    res.json({
      message: 'File metadata saved successfully',
      file: req.file.originalname,
      db_entry: dbRes.rows[0],
    });
  } catch (err) {
    console.error('Backend B /api/b/upload error:', err);
    res.status(500).json({ error: 'Database insertion failed' });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

async function start() {
  try {
    await ensureUploadsTable('backend-b');
    app.listen(port, () => {
      console.log(`Backend B listening on port ${port}`);
    });
  } catch (err) {
    console.error('Backend B failed to start:', err);
    process.exit(1);
  }
}

start();
