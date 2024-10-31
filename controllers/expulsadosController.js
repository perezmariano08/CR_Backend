const db = require('../utils/db');

const getExpulsados = (req, res) => {
    db.query(
        `SELECT
            e.id_expulsion,
            e.id_jugador,
            e.id_partido,
            p.id_categoria,
            CONCAT(j.apellido, ', ', j.nombre) AS jugador,
            c.nombre AS categoria,
            e.fechas,
            e.fechas_restantes,
            e.multa,
            eq.id_equipo,
            CONCAT(ed.nombre, ' ', ed.temporada) AS edicion
        FROM
            expulsados AS e
        INNER JOIN
            jugadores AS j ON j.id_jugador = e.id_jugador
        INNER JOIN
            partidos AS p ON p.id_partido = e.id_partido
        INNER JOIN
            categorias AS c ON c.id_categoria = p.id_categoria
        INNER JOIN
            planteles AS pl ON pl.id_jugador = j.id_jugador
        INNER JOIN
            equipos AS eq ON eq.id_equipo = pl.id_equipo
        INNER JOIN
            ediciones AS ed ON ed.id_edicion = p.id_edicion
        WHERE
            p.id_categoria = pl.id_categoria`
    , (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const calcularExpulsiones = (req, res) => {
    // Consulta para obtener todas las expulsiones activas
    const expulsionQuery = `SELECT * FROM expulsados WHERE estado = 'A'`;

    db.query(expulsionQuery, (err, expulsiones) => {
        if (err) {
            console.error('Error en la consulta de expulsiones:', err);
            return res.status(500).send('Error en la base de datos');
        }

        if (!expulsiones || expulsiones.length === 0) {
            return res.send('No hay sanciones activas para actualizar');
        }

        let updatedCount = 0; // Contador para llevar la cuenta de actualizaciones exitosas

        // Iterar sobre cada expulsión activa
        expulsiones.forEach((expulsion) => {
            const { id_expulsion, id_jugador, fechas, fechas_restantes, id_partido } = expulsion;

            // Consulta para obtener la categoría y fecha del partido de expulsión
            const partidoQuery = `SELECT id_categoria, dia FROM partidos WHERE id_partido = ?`;

            db.query(partidoQuery, [id_partido], (err, partidoData) => {
                if (err) {
                    console.error('Error en la consulta de partidos:', err);
                    return res.status(500).send('Error en la base de datos');
                }

                if (!partidoData || partidoData.length === 0) {
                    console.error('Partido no encontrado para la expulsión:', id_expulsion);
                    return;
                }

                const { id_categoria, dia } = partidoData[0];

                // Convertir la fecha a cadena si es necesario
                const diaString = new Date(dia).toISOString().split('T')[0]; // Formato YYYY-MM-DD

                // Consulta para obtener el equipo del jugador expulsado
                const equipoQuery = `SELECT id_equipo FROM planteles WHERE id_jugador = ? AND id_categoria = ?`;

                db.query(equipoQuery, [id_jugador, id_categoria], (err, equipoData) => {
                    if (err) {
                        console.error('Error en la consulta de equipos:', err);
                        return res.status(500).send('Error en la base de datos');
                    }

                    if (!equipoData || equipoData.length === 0) {
                        console.error('Equipo no encontrado para el jugador:', id_jugador);
                        return;
                    }

                    const id_equipo = equipoData[0].id_equipo;

                    // Consulta para contar los partidos jugados posteriores a la expulsión para el equipo del jugador
                    const partidosPosterioresQuery = `
                        SELECT COUNT(*) AS partidos_jugados 
                        FROM partidos 
                        WHERE (id_equipoLocal = ? OR id_equipoVisita = ?)
                        AND dia > ? 
                        AND estado IN ('F', 'S');
                    `;

                    db.query(partidosPosterioresQuery, [id_equipo, id_equipo, diaString], (err, partidosData) => {
                        if (err) {
                            console.error('Error en la consulta de partidos posteriores:', err);
                            return res.status(500).send('Error en la base de datos');
                        }

                        const partidos_jugados = partidosData[0].partidos_jugados;

                        let nueva_fecha_restante;
                        let nuevo_estado;

                        if (partidos_jugados >= fechas) {
                            // Si se han jugado suficientes partidos para completar la sanción
                            nueva_fecha_restante = 0;
                            nuevo_estado = 'I'; // Inactivo
                        } else {
                            // Si aún quedan fechas restantes
                            nueva_fecha_restante = fechas - partidos_jugados;
                            nuevo_estado = 'A'; // Activo
                        }

                        // Actualizar la expulsión
                        const actualizarExpulsionQuery = `
                            UPDATE expulsados 
                            SET fechas_restantes = ?, estado = ? 
                            WHERE id_expulsion = ?
                        `;

                        db.query(actualizarExpulsionQuery, [nueva_fecha_restante, nuevo_estado, id_expulsion], (err) => {
                            if (err) {
                                console.error('Error al actualizar la expulsión:', err);
                                return res.status(500).send('Error al actualizar la expulsión');
                            }

                            // Si la sanción se ha completado, actualizar el estado en la tabla 'planteles'
                            if (nuevo_estado === 'I') {
                                const updateSancionadoQuery = `
                                    UPDATE planteles 
                                    SET sancionado = 'N' 
                                    WHERE id_jugador = ? AND id_categoria = ?
                                `;

                                db.query(updateSancionadoQuery, [id_jugador, id_categoria], (err) => {
                                    if (err) {
                                        console.error('Error al actualizar sancionado:', err);
                                        return res.status(500).send('Error al actualizar sanción');
                                    }
                                });
                            }

                            updatedCount++;
                            // Verifica si hemos terminado de procesar todas las expulsiones
                            if (updatedCount === expulsiones.length) {
                                res.send('Sanciones actualizadas exitosamente');
                            }
                        });
                    });
                });
            });
        });
    });
};

module.exports = {
    getExpulsados,
    calcularExpulsiones
};
