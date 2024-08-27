const db = require('../utils/db');

const getPartidos = (req, res) => {
    db.query(
            `SELECT
        p.id_edicion,
        p.id_zona,
        p.id_categoria,
        p.id_partido,
        DAY(p.dia) AS dia_numero,
        MONTH(p.dia) AS mes,
        YEAR(p.dia) AS año,
        CASE
            WHEN DAYNAME(p.dia) = 'Monday' THEN 'Lunes'
            WHEN DAYNAME(p.dia) = 'Tuesday' THEN 'Martes'
            WHEN DAYNAME(p.dia) = 'Wednesday' THEN 'Miércoles'
            WHEN DAYNAME(p.dia) = 'Thursday' THEN 'Jueves'
            WHEN DAYNAME(p.dia) = 'Friday' THEN 'Viernes'
            WHEN DAYNAME(p.dia) = 'Saturday' THEN 'Sábado'
            WHEN DAYNAME(p.dia) = 'Sunday' THEN 'Domingo'
        END AS dia_nombre,
        p.id_equipoLocal,
        p.id_equipoVisita,
        p.estado,
        p.jornada,
        p.dia,
        p.hora,
        p.goles_local,
        p.goles_visita,
        p.pen_local,
        p.pen_visita,
        p.cancha,
        p.arbitro,
        p.destacado,
        p.descripcion,
        p.id_planillero,
        j.id_jugador AS jugador_destacado,
        c.nombre AS nombre_categoria,
        CONCAT(e.nombre, ' ', e.temporada) AS nombre_edicion
    FROM
        partidos p
    INNER JOIN
        equipos e1 ON p.id_equipoLocal = e1.id_equipo
    INNER JOIN
        equipos e2 ON p.id_equipoVisita = e2.id_equipo
    LEFT JOIN
        usuarios u ON p.id_planillero = u.id_usuario
    LEFT JOIN
        jugadores j ON p.id_jugador_destacado = j.id_jugador
    LEFT JOIN
        categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN
        ediciones e ON p.id_edicion = e.id_edicion;`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const getIncidenciasPartido = (req, res) => {
    const { id_partido } = req.query;

    db.query('CALL sp_partidos_incidencias(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
}

const getFormacionesPartido = (req, res) => {
    const { id_partido } = req.query;


    // Luego, obtiene las formaciones del partido
    db.query('CALL sp_partidos_formaciones(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado de formaciones:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
};

const crearPartido = (req, res) => {
    const { id_temporada, id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, arbitro, id_planillero } = req.body;
    db.query(`
        INSERT INTO partidos
        (id_temporada, 
        id_equipoLocal, 
        id_equipoVisita, 
        jornada, 
        dia, 
        hora, 
        cancha, 
        arbitro, 
        id_planillero) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [id_temporada, id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, arbitro, id_planillero], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Temporada registrada con éxito');
    });
};

const importarPartidos = (req, res) => {
    const partidos = req.body;
    if (!Array.isArray(partidos)) {
        return res.status(400).send('Invalid data format');
    }

    // Construye el query para insertar múltiples registros
    const values = partidos.map(({ id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria }) => [id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria ]);
    const query = 'INSERT INTO partidos (id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria) VALUES ?';

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al insertar datos en la base de datos');
        }
        res.status(200).send('Datos importados correctamente');
    });
};

const getPlantelesPartido = (req, res) => {
    const { id_partido } = req.query;


    // Luego, obtiene las formaciones del partido
    db.query('CALL sp_get_planteles(?)', [id_partido], (err, result) => {
        if (err) {
            console.error("Error al ejecutar el procedimiento almacenado de planteles:", err);
            if (err.sqlState === '45000') {
                return res.status(400).send(err.sqlMessage);
            }
            return res.status(500).send("Error interno del servidor");
        }

        // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
        if (!result || result.length === 0) {
            return res.status(404).send("No se encontraron incidencias para el partido especificado.");
        }

        // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
        const [rows] = result;

        // Devuelve los datos
        res.status(200).json(rows);
    });
};


module.exports = {
    getPartidos,
    getIncidenciasPartido,
    getFormacionesPartido,
    crearPartido,
    importarPartidos,
    getPlantelesPartido
};