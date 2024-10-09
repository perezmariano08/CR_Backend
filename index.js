const express = require('express');
const https = require('https'); // Requerido para usar socket.io
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const server = https.createServer(app); // Cambia app.listen por http.createServer

// Configuración de CORS
const corsOptions = {
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
    credentials: true,
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions)); // Para las solicitudes HTTP

// Configuración de socket.io
const io = new Server(server, {
    cors: corsOptions, // Usa la misma configuración de CORS
    transports: ['polling']
});

// Permitir conexiones WebSocket desde cualquier origen
io.origins('*');


// Middleware para adjuntar io al objeto req
app.use((req, res, next) => {
    req.io = io; // Adjunta la instancia de io a req
    next();
});

app.use('/admin', require('./routes/adminRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Escucha eventos de acciones y emite la actualización a los clientes
    socket.on('newAction', (actionData) => {
        io.emit('actionUpdate', actionData); // Enviar acción a todos los clientes conectados
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection', reason);
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Corriendo en http://localhost:${port}`);
});
