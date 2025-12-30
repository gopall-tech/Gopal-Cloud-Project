const express = require('express');
const multer = require('multer');
const { pool, ensureUploadsTable } = require('./ensureUploadsTable');

const app = express();
const port = process.env.PORT || 3001;

// Configure Multer (Using Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// Upload route for Backend A
app.post('/api/a/upload', upload.single('file'), async (req, res) => {
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
      process.env.BACKEND_NAME || 'backend-a',
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
    console.error('Backend A /api/a/upload error:', err);
    res.status(500).json({ error: 'Database insertion failed' });
  }
});

// Connectivity test route for Backend A
app.get('/api/a', async (req, res) => {
  try {
    const client = await pool.connect();
    const query = `
      INSERT INTO requests (backend_name, ts, meta) 
      VALUES ($1, NOW(), $2) 
      RETURNING *;
    `;
    const values = ['backend-a', { uploaded: false }];
    const result = await client.query(query, values);
    client.release();

    res.json({
      backend: 'backend-a',
      message: 'Hello from Backend A',
      db_entry: result.rows[0],
    });
  } catch (err) {
    console.error('Backend A /api/a error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

async function start() {
  try {
    await ensureUploadsTable('backend-a');
    app.listen(port, () => {
      console.log(`Backend A running on port ${port}`);
    });
  } catch (err) {
    console.error('Backend A failed to start:', err);
    process.exit(1);
  }
}

start();
