const db = require('../utils/db');

const Sede = {
    getAll: (callback) => {
        db.query('SELECT * FROM sedes', callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO sedes SET ?', data, callback);
    }
};

module.exports = Sede;
