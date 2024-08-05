const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const db = require('./utils/db');
const multer = require('multer');
const path = require('path');
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
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://192.168.0.4:5173', 
        'http://192.168.0.4:5174',
        'http://192.168.100.3:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Configuración del archivo de registro de errores
// const logFile = fs.createWriteStream('error.log', { flags: 'a' });

// process.on('uncaughtException', (err) => {
//   console.error('Unhandled Exception', err);
//   logFile.write(`${new Date().toISOString()} - Unhandled Exception: ${err.stack}\n`);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection', reason);
//   logFile.write(`${new Date().toISOString()} - Unhandled Rejection: ${reason.stack}\n`);
// });

app.listen(port, '0.0.0.0', () => {
    console.log(`Corriendo en http://localhost:${port}`);
});

// // Crear el directorio 'uploads' y sus subdirectorios si no existen
// const uploadDirs = ['uploads', 'uploads/Equipos', 'uploads/Usuarios', 'uploads/Jugadores'];
// uploadDirs.forEach(dir => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// // Configurar almacenamiento para Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let folder = 'uploads/';
//     if (req.path.includes('/upload-image/equipo')) {
//       folder += 'Equipos/';
//     } else if (req.path.includes('/upload-image/usuario')) {
//       folder += 'Usuarios/';
//     } else if (req.path.includes('/upload-image/jugador')) {
//       folder += 'Jugadores/';
//     }
//     cb(null, folder);
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// // Rutas para subir imágenes
// app.post('/upload-image/equipo', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No se ha subido ningún archivo.');
//   }
//   res.send({ imageUrl: `/uploads/Equipos/${req.file.filename}` });
// });

// app.post('/upload-image/usuario', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No se ha subido ningún archivo.');
//   }
//   res.send({ imageUrl: `/uploads/Usuarios/${req.file.filename}` });
// });

// app.post('/upload-image/jugador', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No se ha subido ningún archivo.');
//   }
//   res.send({ imageUrl: `/uploads/Jugadores/${req.file.filename}` });
// });

// // Servir archivos estáticos
// app.use('/uploads', express.static('uploads'));

// Exporta el handler para Vercel
module.exports = (req, res) => {
  app(req, res);
};