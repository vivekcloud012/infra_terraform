const express = require('express');
const { Pool } = require('pg');
const AWS = require('aws-sdk');

const app = express();
const port = process.env.PORT || 3000;

// Initialize AWS SSM
const ssm = new AWS.SSM();

async function getDatabaseConfig() {
  try {
    const [dbHost, dbUser, dbPass, dbName] = await Promise.all([
      getParameter('DB_HOST'),
      getParameter('DB_USER'),
      getParameter('DB_PASSWORD'),
      getParameter('DB_NAME')
    ]);

    return {
      host: dbHost,
      user: dbUser,
      password: dbPass,
      database: dbName,
      port: 5432,
    };
  } catch (error) {
    console.error('Error fetching database config:', error);
    throw error;
  }
}

async function getParameter(name) {
  const param = await ssm.getParameter({
    Name: name,
    WithDecryption: true
  }).promise();
  
  return param.Parameter.Value;
}

// Initialize database connection
let pool;
async function initializeDatabase() {
  const dbConfig = await getDatabaseConfig();
  pool = new Pool(dbConfig);
  
  // Create table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Middleware
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize and start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});