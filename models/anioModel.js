const db = require('../utils/db');

const Anio = {
    getAll: (callback) => {
        db.query('SELECT * FROM años ORDER BY año DESC', callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO años SET ?', data, callback);
    }
};

module.exports = Anio;
