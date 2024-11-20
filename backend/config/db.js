//backend/config/db.js
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the database connection
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection established successfully!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1); 
  }
})();

export default pool;
