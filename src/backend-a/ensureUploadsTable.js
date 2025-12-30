// src/backend-a/ensureUploadsTable.js
// Ensure the `uploads` table exists in PostgreSQL for Backend A.

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let pool;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    ssl: { rejectUnauthorized: false },
  });
}

/**
 * Ensure the `uploads` table exists.
 *
 * @param {string} backendNameHint Optional backend name to log (e.g., "backend-a")
 */
async function ensureUploadsTable(backendNameHint) {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS uploads (
      id           SERIAL PRIMARY KEY,
      backend_name TEXT        NOT NULL,
      file_name    TEXT        NOT NULL,
      file_size    BIGINT,
      mime_type    TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  const createIndexSql = `
    CREATE INDEX IF NOT EXISTS idx_uploads_backend_created_at
      ON uploads (backend_name, created_at DESC);
  `;

  try {
    console.log(
      `Ensuring uploads table exists${
        backendNameHint ? ` (${backendNameHint})` : ''
      }...`
    );
    await pool.query(createTableSql);
    await pool.query(createIndexSql);
    console.log('✅ uploads table is ready');
  } catch (err) {
    console.error('❌ Failed to ensure uploads table:', err);
    throw err;
  }
}

module.exports = {
  pool,
  ensureUploadsTable,
};
