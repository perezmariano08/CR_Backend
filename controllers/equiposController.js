const db = require('../utils/db');

const getEquipos = (req, res) => {
    db.query(
        `SELECT
    e.id_equipo,
    e.nombre,
    e.img,
    e.id_categoria,
    CONCAT(
        IFNULL((SELECT COUNT(*) FROM jugadores j WHERE j.id_equipo = e.id_equipo), 0),
        ' ',
        IFNULL(
            CASE 
                WHEN c.genero = 'F' THEN 
                    CASE WHEN (SELECT COUNT(*) FROM jugadores j WHERE j.id_equipo = e.id_equipo) = 1 THEN 'jugadora' ELSE 'jugadoras' END
                ELSE 
                    CASE WHEN (SELECT COUNT(*) FROM jugadores j WHERE j.id_equipo = e.id_equipo) = 1 THEN 'jugador' ELSE 'jugadores' END
            END,
            ''
        )
    ) AS jugadores
FROM 
    equipos AS e
LEFT JOIN 
    categorias AS c ON c.id_categoria = e.id_categoria
ORDER BY 
    e.nombre;`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const crearEquipo = (req, res) => {
    const { id_categoria, id_edicion, nombre } = req.body;
    db.query(
        `INSERT INTO 
        equipos(id_categoria, id_edicion, nombre) 
        VALUES (?, ?, ?)`, [id_categoria, id_edicion, nombre], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Equipo registrado con éxito');
    });
};

const updateEquipo = (req, res) => {
    const { id_equipo, nombre } = req.body;

    // Validar que el id esté presente
    if (!id_equipo) {
        return res.status(400).send('ID de equipo es requerido');
    }

    // Construir la consulta SQL
    const sql = `
        UPDATE equipos
        SET 
            nombre = ?
        WHERE id_equipo = ?;
    `;

    // Ejecutar la consulta
    db.query(sql, [nombre, id_equipo], (err, result) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Equipo actualizado exitosamente');
    });
};

const getJugadoresEquipo = (req, res) => {
    const { id_temporada, id_equipo } = req.query;

    db.query('CALL sp_jugadores_equipo(?, ?)', [id_temporada ,id_equipo], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron jugadores en el equipo especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
}

const eliminarEquipo = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM equipos WHERE id_equipo = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la edicion:', err);
            return res.status(500).send('Error eliminando la edicion');
        }
        res.status(200).send('Edicion eliminada correctamente');
    });
};

const actualizarCategoriaEquipo = (req, res) => {
    const { id_categoriaNueva, id_equipo } = req.body;

    // Validar que el id esté presente
    if (!id_equipo) {
        return res.status(400).send('ID de equipo es requerido');
    }

    // Construir la consulta SQL
    const sql = `
        UPDATE equipos
        SET 
            id_categoria = ?
        WHERE id_equipo = ?;
    `;

    // Ejecutar la consulta
    db.query(sql, [id_categoriaNueva, id_equipo ], (err, result) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Equipo actualizado exitosamente');
    });
};

module.exports = {
    getEquipos,
    crearEquipo,
    updateEquipo,
    actualizarCategoriaEquipo,
    getJugadoresEquipo,
    eliminarEquipo
};
