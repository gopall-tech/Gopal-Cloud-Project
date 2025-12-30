// src/backend-b/ensureUploadsTable.js
// Ensure the `uploads` and `requests` tables exist in PostgreSQL for Backend B.

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
 * Ensure the `uploads` and `requests` tables exist (and patch schema drift).
 *
 * @param {string} backendNameHint Optional backend name to log (e.g., "backend-b")
 */
async function ensureUploadsTable(backendNameHint = 'backend-b') {
  const client = await pool.connect();

  try {
    console.log(`Ensuring uploads & requests tables exist (${backendNameHint})...`);

    const createUploadsTableSql = `
      CREATE TABLE IF NOT EXISTS uploads (
        id           SERIAL PRIMARY KEY,
        backend_name TEXT        NOT NULL,
        file_name    TEXT        NOT NULL,
        file_size    BIGINT,
        mime_type    TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    const createUploadsIndexSql = `
      CREATE INDEX IF NOT EXISTS idx_uploads_backend_created_at
        ON uploads (backend_name, created_at DESC);
    `;

    const createRequestsTableSql = `
      CREATE TABLE IF NOT EXISTS requests (
        id           SERIAL PRIMARY KEY,
        backend_name TEXT        NOT NULL,
        ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        meta         JSONB
      );
    `;

    const patchRequestsSchemaSql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='requests' AND column_name='ts'
        ) THEN
          ALTER TABLE requests ADD COLUMN ts TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='requests' AND column_name='meta'
        ) THEN
          ALTER TABLE requests ADD COLUMN meta JSONB;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='requests' AND column_name='created_at'
        ) THEN
          EXECUTE 'UPDATE requests SET ts = COALESCE(ts, created_at, NOW()) WHERE ts IS NULL';
        ELSE
          EXECUTE 'UPDATE requests SET ts = COALESCE(ts, NOW()) WHERE ts IS NULL';
        END IF;

        ALTER TABLE requests ALTER COLUMN ts SET DEFAULT NOW();
        ALTER TABLE requests ALTER COLUMN ts SET NOT NULL;
      END $$;
    `;

    const createRequestsIndexSql = `
      CREATE INDEX IF NOT EXISTS idx_requests_backend_ts
        ON requests (backend_name, ts DESC);
    `;

    await client.query(createUploadsTableSql);
    await client.query(createUploadsIndexSql);

    await client.query(createRequestsTableSql);
    await client.query(patchRequestsSchemaSql);
    await client.query(createRequestsIndexSql);

    console.log(`✅ uploads & requests tables are ready (${backendNameHint})`);
  } catch (err) {
    console.error(`❌ Failed to ensure uploads/requests tables (${backendNameHint}):`, err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  ensureUploadsTable,
};
