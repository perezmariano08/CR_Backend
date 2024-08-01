const db = require('../utils/db');

const getEquipos = (req, res) => {
    db.query(
        `SELECT
            e.id_equipo,
            e.nombre,
            e.img,
            c.nombre AS categoria,
            e.descripcion,
            d.nombre AS division,
            t.id_temporada,
            CONCAT(tor.nombre, ' ', a.año, ' - ', d.nombre) as temporada
        FROM equipos AS e
        INNER JOIN categorias AS c ON c.id_categoria = e.id_categoria
        LEFT JOIN temporadas AS t ON t.id_temporada = e.id_temporada
        LEFT JOIN torneos AS tor ON tor.id_torneo = t.id_torneo
        LEFT JOIN años AS a ON a.id_año = t.id_año
        LEFT JOIN divisiones AS d ON d.id_division = e.id_division
        ORDER BY e.nombre`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const crearEquipo = (req, res) => {
    const { nombre, img, categoria, division, descripcion } = req.body;
    db.query(
        `INSERT INTO 
        equipos(nombre, id_categoria, id_division, descripcion, img) 
        VALUES (?, ?, ?, ?, ?)`, [nombre, categoria, division, descripcion, img], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Temporada registrada con éxito');
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

module.exports = {
    getEquipos,
    crearEquipo,
    updateEquipo,
    getJugadoresEquipo
};
