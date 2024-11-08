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
        tipo_zona, id_edicion 
    } = req.body;

    if (tipo_zona === 'todos-contra-todos') {
        db.query(`INSERT INTO 
            zonas(id_categoria, nombre, tipo_zona, cantidad_equipos, fase, id_etapa) 
            VALUES (?, ?, ?, ?, ?, ?)`, [id_categoria, nombre, tipo_zona, cantidad_equipos, fase, id_etapa], (err, result) => {
            if (err) return res.status(500).send('Error interno del servidor');
            return res.send('Categoria registrada con éxito');
        });
    }

    if (tipo_zona === 'eliminacion-directa') {
        // Buscar la zona de la fase anterior
        db.query(`SELECT id_zona FROM zonas WHERE id_categoria = ? AND fase = ? ORDER BY id_zona DESC LIMIT 1`, 
        [id_categoria, fase - 1], 
        (err, resultZona) => {
            if (err) return res.status(500).send('Error al obtener la zona de la fase anterior');

            const zonaAnteriorId = resultZona[0]?.id_zona;
            if (!zonaAnteriorId) return res.status(404).send('Zona anterior no encontrada');

            // Obtener la jornada más alta de los partidos en esa zona anterior
            db.query(`SELECT MAX(jornada) AS maxJornada FROM partidos WHERE id_zona = ?`, 
            [zonaAnteriorId], 
            (err, resultJornada) => {
                if (err) return res.status(500).send('Error al obtener la jornada máxima de la zona anterior');
                
                const maxJornada = resultJornada[0]?.maxJornada || 0;
                const nuevaJornada = maxJornada + 1;

                // Llamar al procedimiento almacenado con la nueva jornada calculada
                db.query(`CALL sp_crear_vacantes_partidos_zonas(?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [id_categoria, nombre, cantidad_equipos, id_etapa, fase, tipo_zona, nuevaJornada, id_edicion], 
                    (err, result) => {
                        if (err) return res.status(500).send('Error interno del servidor');
                        return res.send('Zona de vacantes y partidos registrada con éxito');
                });
            });
        });
    }
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

const getEtapas = (req, res) => {
    const sql = `SELECT * FROM etapas`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error obteniendo las etapas:', err);
            return res.status(500).send('Error obteniendo las etapas');
        }
        return res.status(200).json(result);
    });
};

module.exports = {
    crearZona,
    crearZonaVacantesPartidos,
    eliminarZona,
    getEtapas
};