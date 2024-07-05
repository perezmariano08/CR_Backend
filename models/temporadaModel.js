const db = require('../utils/db');

const Temporada = {
    getAll: (callback) => {
        db.query(`SELECT id_temporada, torneos.nombre AS torneo, categorias.nombre AS categoria, años.año, sedes.nombre AS sede, temporadas.descripcion 
                FROM temporadas 
                INNER JOIN torneos ON temporadas.id_torneo = torneos.id_torneo 
                INNER JOIN categorias ON temporadas.id_categoria = categorias.id_categoria 
                INNER JOIN años ON temporadas.id_año = años.id_año 
                INNER JOIN sedes ON temporadas.id_sede = sedes.id_sede`, callback);
    },
    create: (data, callback) => {
        db.query('INSERT INTO temporadas SET ?', data, callback);
    }
};

module.exports = Temporada;
