const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

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
        'https://prueba.coparelampago.com', 
        'https://coparelampago.com',
        'https://www.coparelampago.com',
        'https://appcoparelampago.vercel.app',
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://192.168.0.13:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Deshabilitar el caché para todas las respuestas
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Configuración del archivo de registro de errores
// const logFile = fs.createWriteStream('error.log', { flags: 'a' });

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err);
    //   logFile.write(`${new Date().toISOString()} - Unhandled Exception: ${err.stack}\n`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection', reason);
    //   logFile.write(`${new Date().toISOString()} - Unhandled Rejection: ${reason.stack}\n`);
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Corriendo en http://localhost:${port}`);
});

server.setTimeout(30000)

// Exporta el handler para Vercel
module.exports = (req, res) => {
    app(req, res);
};
