const mysql = require('mysql');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const pool = mysql.createPool({
    connectionLimit: 60,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    flags: 'keep-alive'
});

// Configuración del archivo de registro de errores
// const logFile = fs.createWriteStream('db_error.log', { flags: 'a' });

pool.on('connection', function (connection) {
  console.log('DB Connection established');

  connection.on('error', function (err) {
      console.error(new Date(), 'MySQL error', err.code);
  });
  connection.on('close', function (err) {
      console.error(new Date(), 'MySQL close', err);
  });
});

function handleDisconnect() {
  pool.getConnection((err, connection) => {
      if (err) {
          console.error('Error conectando a la base de datos:', err);
          setTimeout(handleDisconnect, 2000); // Reintentar conexión
      } else {
          console.log('Conexión exitosa a la base de datos');
          if (connection) connection.release();
      }
  });

  pool.on('error', (err) => {
      console.error('Database error', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          handleDisconnect(); // Reintentar conexión
      } else {
          throw err;
      }
  });
}

handleDisconnect();

module.exports = pool;

