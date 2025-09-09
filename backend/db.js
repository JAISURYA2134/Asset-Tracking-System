const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: '127.0.0.2',
  port: 3306,
  user: 'root',
  password: 'Jai_surya@yt', // No password
  database: 'assertsys'
});
module.exports = pool;
