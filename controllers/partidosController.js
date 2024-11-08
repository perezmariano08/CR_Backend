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
        CONCAT(u.nombre, ' ', u.apellido) AS planillero,
        CONCAT(e.nombre, ' ', e.temporada) AS nombre_edicion,
        p.vacante_local,
        p.vacante_visita,
        p.id_partido_previo_local,
        p.id_partido_previo_visita,
        p.res_partido_previo_local,
        p.res_partido_previo_visita,
        p.id_partido_posterior_ganador,
        p.id_partido_posterior_perdedor
    FROM
        partidos p
    LEFT JOIN
        equipos e1 ON p.id_equipoLocal = e1.id_equipo
    LEFT JOIN
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
    const { id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, arbitro, id_planillero, id_edicion, id_categoria, id_zona } = req.body;
    db.query(`
        INSERT INTO partidos(
            id_equipoLocal, 
            id_equipoVisita, 
            jornada, 
            dia, 
            hora, 
            cancha, 
            arbitro, 
            id_planillero,
            id_edicion,
            id_categoria,
            id_zona
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, arbitro, id_planillero, id_edicion, id_categoria, id_zona], (err, result) => {
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
    const values = partidos.map(({ id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria, id_zona, id_edicion }) => [id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria, id_zona, id_edicion]);
    const query = 'INSERT INTO partidos (id_equipoLocal, id_equipoVisita, jornada, dia, hora, cancha, id_categoria, id_zona, id_edicion) VALUES ?';

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

const updatePartido = (req, res) => {
    const { 
        id_equipoLocal, 
        id_equipoVisita, 
        goles_local,
        goles_visita,
        jornada, 
        dia, 
        hora, 
        cancha, 
        arbitro, 
        id_planillero, 
        id_edicion, 
        id_categoria, 
        id_zona,
        estado, 
        id_partido 
    } = req.body;

    // Validar que id_partido esté presente
    if (!id_partido) {
        return res.status(400).send('ID de partido es requerido');
    }
    
    // Construir la consulta SQL
    const sql = `
        UPDATE partidos
        SET 
            id_equipoLocal = ?, 
            id_equipoVisita = ?, 
            goles_local = ?,
            goles_visita = ?,
            jornada = ?, 
            dia = ?, 
            hora = ?,
            cancha = ?,
            arbitro = ?,
            id_planillero = ?,
            id_edicion = ?, 
            id_categoria = ?, 
            id_zona = ?,
            estado = ?
        WHERE id_partido = ?
    `;

    // Ejecutar la consulta
    db.query(sql, [
        id_equipoLocal, 
        id_equipoVisita, 
        goles_local,
        goles_visita,
        jornada, 
        dia, 
        hora, 
        cancha, 
        arbitro, 
        id_planillero, 
        id_edicion, 
        id_categoria, 
        id_zona, 
        estado,
        id_partido 
    ], (err, result) => {
        if (err) {
            console.error('Error al actualizar el partido:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Partido actualizado exitosamente');
    });
};

const deletePartido = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM partidos WHERE id_partido = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando el partido:', err);
            return res.status(500).send('Error eliminando el partido');
        }
        res.status(200).send('Partido eliminado correctamente');
    });
};

const getPartidosCategoria = (req, res) => {
    const { id_categoria } = req.query;

    const query = `
    SELECT 
        CONCAT(r.resultado, '-' ,p.id_partido) AS id_partido,
        r.resultado,
        p.id_partido as id_partido_numero,
        CAST(
            CONCAT(
                CASE WHEN r.resultado = 'G' THEN 'Ganador' ELSE 'Perdedor' END,
                ' ', 
                CHAR(64 + z.fase), 
                p.vacante_local, 
                '-', 
                CHAR(64 + z.fase), 
                p.vacante_visita
            ) AS CHAR
        ) AS nombre_fase
    FROM 
        partidos AS p
    INNER JOIN 
        zonas AS z ON p.id_zona = z.id_zona
    CROSS JOIN 
        (SELECT 'G' AS resultado UNION ALL SELECT 'P') AS r
    WHERE 
        p.id_categoria = ?
    ORDER BY 
        r.resultado ASC, -- Primero ganadores ('G') y luego perdedores ('P')
        p.id_partido;
`;

    db.query(query, [id_categoria], (err, result) => {
        if (err) {
            console.error('Error al obtener los partidos de la zona:', err);
            return res.status(500).send('Error interno del servidor');
        }

        // Devuelve los datos
        res.status(200).json(result);
    });
};

const getPartidosZona = (req, res) => {
    const { id_zona } = req.query;

    const query = `
    SELECT 
        CONCAT(r.resultado, '-' ,p.id_partido) AS id_partido,
        CAST(
            CONCAT(
                CASE WHEN r.resultado = 'G' THEN 'Ganador' ELSE 'Perdedor' END,
                ' ', 
                CHAR(64 + z.fase), 
                p.vacante_local, 
                '-', 
                CHAR(64 + z.fase), 
                p.vacante_visita
            ) AS CHAR
        ) AS nombre_fase
    FROM 
        partidos AS p
    INNER JOIN 
        zonas AS z ON p.id_zona = z.id_zona
    CROSS JOIN 
        (SELECT 'G' AS resultado UNION ALL SELECT 'P') AS r
    WHERE 
        p.id_zona = ?
    ORDER BY 
        r.resultado ASC, -- Primero ganadores ('G') y luego perdedores ('P')
        p.id_partido;
`;

    db.query(query, [id_zona], (err, result) => {
        if (err) {
            console.error('Error al obtener los partidos de la zona:', err);
            return res.status(500).send('Error interno del servidor');
        }

        // Devuelve los datos
        res.status(200).json(result);
    });
};


const guardarVacantePlayOff = (req, res) => {
    const {id_partido, id_partido_previo, vacante, resultado} = req.body;

    const query = `CALL sp_agregar_enfrentamiento_vacante(?, ?, ?, ?)`;

    db.query(query, [id_partido, id_partido_previo, vacante, resultado], (err, result) => {
        if (err) {
            console.error('Error al guardar el vacante:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Vacante guardada con éxito');
    });
}

const actualizarPartidoVacante = (req, res) => {
    const { id_partido } = req.body;

    const query = `CALL sp_actualizar_partido_vacante(?)`;

    db.query(query, [id_partido], (err, result) => {
        if (err) {
            console.error('Error al actualizar el vacante:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Vacante actualizado con éxito');
    });
}

module.exports = {
    getPartidos,
    getIncidenciasPartido,
    getFormacionesPartido,
    crearPartido,
    importarPartidos,
    getPlantelesPartido,
    updatePartido,
    deletePartido,
    getPartidosZona,
    guardarVacantePlayOff,
    getPartidosCategoria,
    actualizarPartidoVacante
};