const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');  // Módulo para el sistema de archivos
const db = require('./utils/db');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: [
        'https://cr-sistema.vercel.app', 
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://192.168.0.4:5173', 
        'http://192.168.0.4:5174'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Configuración del archivo de registro de errores
const logFile = fs.createWriteStream('error.log', { flags: 'a' });

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception', err);
  logFile.write(`${new Date().toISOString()} - Unhandled Exception: ${err.stack}\n`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection', reason);
  logFile.write(`${new Date().toISOString()} - Unhandled Rejection: ${reason.stack}\n`);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Corriendo en http://localhost:${port}`);
});
