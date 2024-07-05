const db = require('../utils/db');

const Categoria = {
    getAll: (callback) => {
        db.query('SELECT * FROM categorias', callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO categorias SET ?', data, callback);
    }
};

module.exports = Categoria;
