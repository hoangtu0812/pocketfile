const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pocketfile',
  user: process.env.DB_USER || 'pocketfile',
  password: process.env.DB_PASSWORD || 'pocketfile_password',
});

// Retry helper to wait for PostgreSQL to be ready (useful in Docker Compose)
const waitForDb = async (retries = 10, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      const isLast = attempt === retries;
      console.warn(
        `DB not ready (attempt ${attempt}/${retries}): ${error.message}${
          isLast ? '' : ` - retrying in ${delayMs / 1000}s`
        }`
      );
      if (isLast) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

const init = async () => {
  try {
    await waitForDb();

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create files table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        project_id INTEGER REFERENCES projects(id),
        version VARCHAR(50) NOT NULL,
        uploaded_by INTEGER REFERENCES users(id),
        upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin exists
    const adminCheck = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
    if (parseInt(adminCheck.rows[0].count) === 0) {
      console.log('No admin user found. First login will create admin user.');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  init
};

