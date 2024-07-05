const db = require('../utils/db');

const User = {
    getAll: (callback) => {
        db.query('SELECT * FROM usuarios', callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO usuarios SET ?', data, callback);
    },
    findByEmail: (email, callback) => {
        db.query('SELECT * FROM usuarios WHERE email = ?', [email], callback);
    },
    findByDni: (dni, callback) => {
        db.query('SELECT * FROM usuarios WHERE dni = ?', [dni], callback);
    }
};

module.exports = User;
