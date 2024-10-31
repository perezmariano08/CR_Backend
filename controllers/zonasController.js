const db = require('../utils/db');

const crearZona = (req, res) => {
    const {	id_categoria, nombre, tipo_zona, cantidad_equipos } = req.body;
    db.query(`INSERT INTO 
        zonas(id_categoria, nombre, tipo_zona, cantidad_equipos) 
        VALUES (?, ?, ?, ?)`, [id_categoria, nombre, tipo_zona, cantidad_equipos], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Categoria registrada con éxito');
    });
};

const crearZonaVacantesPartidos = (req, res) => {
    const { 
        id_categoria, nombre, cantidad_equipos, id_etapa, fase, 
        tipo_zona, jornada, id_edicion 
    } = req.body;

    db.query(`CALL sp_crear_vacantes_partidos_zonas(?, ?, ?, ?, ?, ?, ?, ?)`, 
        [id_categoria, nombre, cantidad_equipos, id_etapa, fase, tipo_zona, jornada, id_edicion], 
        (err, result) => {
            if (err) return res.status(500).send('Error interno del servidor');
            res.send('Zona de vacantes y partidos registrada con éxito');
    });
};


const eliminarZona = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM zonas WHERE id_zona = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la edicion:', err);
            return res.status(500).send('Error eliminando la edicion');
        }
        res.status(200).send('Edicion eliminada correctamente');
    });
};

module.exports = {
    crearZona,
    crearZonaVacantesPartidos,
    eliminarZona
};