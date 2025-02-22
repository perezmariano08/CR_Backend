const jsonwebtoken = require('jsonwebtoken');
const db = require('../utils/db');
const dotenv = require('dotenv');

dotenv.config();

function revisarToken(req, res, next) {
    try {
        // Obtener el token del encabezado
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ mensaje: 'Usuario no autenticado' });
        }

        // Verificar el formato del encabezado
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(400).json({ mensaje: 'Token no proporcionado' });
        }
        
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);

        // Verificar si el usuario existe en la base de datos
        db.query('SELECT * FROM usuarios WHERE dni = ?', [decoded.user], (err, result) => {
            if (err) {
                console.error('Error al buscar usuario:', err);
                return res.status(500).json({ mensaje: 'Error interno del servidor' });
            }

            if (result.length === 0) {
                return res.status(401).json({ mensaje: 'Usuario no encontrado' });
            }

            req.user = result[0];
            next();
        });
    } catch (error) {
        // Manejo de errores relacionados con JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: 'El token ha expirado. Por favor, inicia sesión nuevamente.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ mensaje: 'Token inválido' });
        }
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

function revisarAdmin(req, res, next) {
    if (req.user && req.user.id_rol === 1) {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso denegado' });
    }
}

function revisarPlanillero(req, res, next) {
    if (req.user && req.user.id_rol === 2) {
        next();
    } else {
        res.status(403).json({ mensaje: 'Acceso denegado' });
    }
}

module.exports = {
    revisarToken,
    revisarAdmin,
    revisarPlanillero
};
