const jsonwebtoken = require('jsonwebtoken');
const db = require('../utils/db');

function revisarCookie(req, res, next) {
    try {
        const jwtCookie = req.cookies.jwt;
        if (!jwtCookie) return res.status(401).send('Usuario no autenticado');

        const decoded = jsonwebtoken.verify(jwtCookie, process.env.JWT_SECRET);
        db.query('SELECT * FROM usuarios WHERE dni = ?', [decoded.user], (err, result) => {
            if (err || result.length === 0) return res.status(401).send('Usuario no encontrado');
            req.user = result[0];
            next();
        });
    } catch (error) {
        console.error('Middleware revisarCookie - error:', error);
        return res.status(500).send('Error interno del servidor');
    }
}

function revisarAdmin(req, res, next) {
    if (req.user && req.user.id_rol === 1) next();
    else res.status(403).send('Acceso denegado');
}

function revisarPlanillero(req, res, next) {
    if (req.user && req.user.id_rol === 2) next();
    else res.status(403).send('Acceso denegado');
}

module.exports = {
    revisarCookie,
    revisarAdmin,
    revisarPlanillero
};
