const db = require('../utils/db');

const getPosicionesTemporada = (req, res) => {
    const { id_zona } = req.query;

    db.query('CALL sp_posiciones_zona(?)', [id_zona], (err, result) => {
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

const getEstadisticasCategoria = (req, res) => {
    const { id_categoria, estadistica } = req.query;

    db.query('CALL sp_estadisticas_categoria(?,?)', [id_categoria, estadistica], (err, result) => {
            if (err) {
                console.error("Error al ejecutar el procedimiento almacenado:", err);
                if (err.sqlState === '45000') {
                    return res.status(400).send(err.sqlMessage);
                }
                return res.status(500).send("Error interno del servidor");
            }

            // Si result está vacío, verifica que el procedimiento almacenado no esté retornando resultados vacíos
            if (!result || result.length === 0) {
                return res.status(404).send("No se encontraron goleadores para la temporada especificada.");
            }

            // En result, el primer elemento del array contiene el conjunto de resultados del procedimiento almacenado
            const [rows] = result;

            // Devuelve los datos
            res.status(200).json(rows);
        });
}

const getZonas = (req, res) => {
    db.query(`SELECT
        z.id_zona,
        c.id_categoria,
        CONCAT(e.nombre, ' ', e.temporada) AS nombre_edicion,
        c.nombre AS nombre_categoria,
        z.nombre AS nombre_zona,
        c.genero AS genero,
        z.tipo_zona,
        z.cantidad_equipos,
        z.fase,
        z.id_etapa,
        z.campeon,
        z.id_equipo_campeon,
        z.terminada,
        CONCAT(z.nombre, ' - ', et.nombre) AS nombre_zona_etapa,
        et.nombre AS nombre_etapa -- Agrega el nombre de la etapa
    FROM
        categorias AS c
        INNER JOIN ediciones AS e ON e.id_edicion = c.id_edicion
        INNER JOIN zonas AS z ON z.id_categoria = c.id_categoria
        INNER JOIN etapas AS et ON et.id_etapa = z.id_etapa -- Asegúrate de que esta relación sea correcta
    ORDER BY
        3;
    `, 
    (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const getTemporadas = (req, res) => {
    db.query(`
SELECT
    t.id_zona,
    z.tipo_zona,
    t.id_edicion,
    t.id_categoria,
    t.id_equipo,
    e.nombre AS nombre_equipo,
    t.vacante,
    t.apercibimientos,
    t.pos_zona_previa,
    t.id_zona_previa,
    (SELECT COUNT(*)
        FROM planteles p
        INNER JOIN jugadores j ON p.id_jugador = j.id_jugador
        WHERE p.id_equipo = t.id_equipo AND t.id_categoria = p.id_categoria
        AND j.dni IS NOT NULL
        AND p.eventual = 'N') AS jugadores_con_dni,
    (SELECT COUNT(*)
        FROM planteles p
        INNER JOIN jugadores j ON p.id_jugador = j.id_jugador
        WHERE p.id_equipo = t.id_equipo AND t.id_categoria = p.id_categoria
        AND j.dni IS NULL
        AND p.eventual = 'N') AS jugadores_sin_dni
FROM 
    temporadas t
    LEFT JOIN equipos e ON e.id_equipo = t.id_equipo
    LEFT JOIN zonas z ON z.id_zona = t.id_zona;
`, 
    (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const insertarEquipoTemporada = (req, res) => {
    const { id_categoria, id_edicion, id_zona, id_equipo, vacante, id_partido } = req.body;
    console.log(id_categoria, id_edicion, id_zona, id_equipo, vacante, id_partido);
    
    // Paso 1: Consultar el tipo de zona
    const consultaTipoZona = `SELECT tipo_zona FROM zonas WHERE id_zona = ?`;

    db.query(consultaTipoZona, [id_zona], (err, result) => {
        if (err) {
            console.error("Error al consultar el tipo de zona:", err);
            return res.status(500).json({mensaje: 'Error al consultar el tipo de zona'});
        }
        
        // Verificar si se encontró el tipo de zona
        if (result.length === 0) {
            console.warn("Zona no encontrada para id_zona:", id_zona);
            return res.status(404).json({mensaje: 'Zona no encontrada'});
        }

        const tipoZona = result[0].tipo_zona;

        // Paso 2: Insertar o actualizar el registro en la tabla temporadas
        const query = `
            UPDATE temporadas 
            SET 
                id_equipo = ?
            WHERE 
                id_categoria = ? AND 
                id_edicion = ? AND
                vacante = ? AND
                id_zona = ?
        `;
    
        db.query(query, [id_equipo, id_categoria, id_edicion, vacante, id_zona], (err, result) => {
            if (err) {
                console.error("Error al insertar o actualizar en temporadas:", err);
                return res.status(500).json({mensaje: 'Error interno del servidor al insertar o actualizar'});
            }

            // Paso 3: Si el tipo de zona es 'eliminacion-directa', llamar al procedimiento almacenado
            if (tipoZona === 'eliminacion-directa' || tipoZona === 'eliminacion-directa-ida-vuelta') {
                const spQuery = `CALL sp_agregar_vacante_zona(?, ?, ?, ?)`;
                const spParams = [id_zona, id_equipo, vacante, id_partido];

                db.query(spQuery, spParams, (err, spResult) => {
                    if (err) {
                        console.error("Error al ejecutar el procedimiento almacenado:", err);
                        return res.status(500).json({mensaje: 'Error interno al ejecutar el procedimiento almacenado'});
                    }

                    return res.status(200).json({mensaje: 'Edición registrada o actualizada con éxito, y procedimiento ejecutado'});
                });
            } else {
                console.log("Zona no es de tipo 'eliminacion-directa', no se llama al procedimiento almacenado.");
                return res.status(200).json({mensaje: 'Edición registrada o actualizada con éxito'});
            }
        });
    });
};

const insertarEquipoTemporadaCategoria = (req, res) => {
    const { id_categoria, id_edicion, id_zona, id_equipo, vacante } = req.body;

    const insertQuery = `
        INSERT INTO temporadas (id_categoria, id_edicion, id_zona, id_equipo, vacante)
        VALUES (?, ?, NULL, ?, NULL)
    `;

    const queryParams = [id_categoria, id_edicion, id_equipo];

    db.query(insertQuery, queryParams, (err, result) => {
        if (err) {
            console.error("Error al insertar en categorias:", err);
            return res.status(500).json({ mensaje: 'Error interno al insertar en categorias' });
        }

        console.log("Registro insertado en categorias con éxito:", result);
        return res.status(200).json({ mensaje: 'Registro insertado en categorias con éxito' });
    });
};


const eliminarEquipoTemporada = (req, res) => {
    const { id_equipo, id_categoria, id_edicion } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'UPDATE temporadas SET id_equipo = NULL WHERE id_equipo = ? AND id_categoria = ? AND id_edicion = ?';

    db.query(sql, [id_equipo, id_categoria, id_edicion], (err, result) => {
        if (err) {
            console.error('Error eliminando la edicion:', err);
            return res.status(500).send('Error eliminando la edicion');
        }
        res.status(200).send('Edicion eliminada correctamente');
    });
};

const determinarVentaja = (req, res) => {
    const { id_zona, vacante } = req.body;

    const query = `
        SELECT t.ventaja
        FROM temporadas t
        JOIN zonas z ON t.id_zona = z.id_zona
        WHERE t.id_zona = ?
        AND t.vacante = ?
        AND z.tipo_zona = 'eliminacion-directa';
    `
    db.query(query, [id_zona, vacante], (err, result) => {
        if (err) {
            console.error('Error al obtener la ventaja:', err);
            return res.status(500).send('Error interno del servidor');
        }
        return res.status(200).json(result[0]);
    })
}

module.exports = {
    getPosicionesTemporada,
    getEstadisticasCategoria,
    getZonas,
    getTemporadas,
    insertarEquipoTemporada,
    eliminarEquipoTemporada,
    insertarEquipoTemporadaCategoria,
    determinarVentaja
};