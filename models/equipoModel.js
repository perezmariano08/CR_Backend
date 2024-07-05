const db = require('../utils/db');

const Equipo = {
    getAll: (callback) => {
        db.query('SELECT * FROM equipos', callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO equipos SET ?', data, callback);
    }
};

module.exports = Equipo;
