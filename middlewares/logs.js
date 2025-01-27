const db = require('../utils/db');

const logMiddleware = (req, res, next) => {
    const { method, originalUrl } = req;
    const user_id = req.user?.id_usuario || 'Usuario no autenticado';
    const timestamp = new Date().toISOString();

    const logEntry = {
        user_id,
        action: method,
        timestamp,
        endpoint: originalUrl,
        request_data: JSON.stringify(req.body),
        response_status: res.statusCode || 200,
    };

    db.query('INSERT INTO logs_auditoria SET ?', logEntry, (err) => {
        if (err) console.error('Error al registrar log:', err);
        else console.log('Log de auditoría registrado con éxito');
    });

    next();
};

module.exports = logMiddleware;
