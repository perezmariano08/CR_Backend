const db = require('../utils/db');

const Torneo = {
    getAll: (callback) => {
        db.query('SELECT * FROM torneos', callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO torneos SET ?', data, callback);
    }
};

module.exports = Torneo;
