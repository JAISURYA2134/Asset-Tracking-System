const pool = require('./db');

// Simple test script to check MySQL connection
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('MySQL connection successful! Test result:', rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  }
})();

