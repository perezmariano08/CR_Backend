const mysql = require('mysql');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 20,
  host: 'srv1196.hstgr.io',
  user: 'u436441116_mariano',
  password: 'H^0enpzw',
  database: 'u436441116_database',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
});

// Configuración del archivo de registro de errores
// const logFile = fs.createWriteStream('db_error.log', { flags: 'a' });

pool.on('connection', (connection) => {
  console.log('Nueva conexión establecida');
  connection.on('error', (err) => {
    console.error('Error en la conexión:', err);
    // logFile.write(`${new Date().toISOString()} - Error en la conexión: ${err.stack}\n`);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();  // Manejar la pérdida de conexión
    } else {
      throw err;
    }
  });
});

pool.on('acquire', (connection) => {
  console.log('Conexión adquirida:', connection.threadId);
});

pool.on('release', (connection) => {
  console.log('Conexión liberada:', connection.threadId);
});

const handleDisconnect = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error al reconectar:', err);
      setTimeout(handleDisconnect, 2000); 
    } else {
      console.log('Reconectado a la base de datos');
      if (connection) connection.release();
    }
  });
};

module.exports = pool;
