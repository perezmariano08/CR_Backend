const db = require('../utils/db');

const getExpulsados = (req, res) => {
    db.query(
    `SELECT
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
        p.id_categoria = pl.id_categoria;`
    , (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const calcularExpulsiones = async (req, res) => {
    try {
        // Traer todas las expulsiones con fechas restantes > 0
        const expulsiones = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM expulsados WHERE fechas_restantes > 0', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Traer todos los partidos finalizados
        const partidos = await new Promise((resolve, reject) => {
            db.query('SELECT id_partido, id_equipoLocal, id_equipoVisita, dia, id_categoria FROM partidos WHERE estado = "F"', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Crear un mapa de partidos por equipo y categoría
        const partidosEquiposCategorias = {};
        partidos.forEach(p => {
            if (!partidosEquiposCategorias[p.id_equipoLocal]) {
                partidosEquiposCategorias[p.id_equipoLocal] = {};
            }
            if (!partidosEquiposCategorias[p.id_equipoVisita]) {
                partidosEquiposCategorias[p.id_equipoVisita] = {};
            }
            if (!partidosEquiposCategorias[p.id_equipoLocal][p.id_categoria]) {
                partidosEquiposCategorias[p.id_equipoLocal][p.id_categoria] = [];
            }
            if (!partidosEquiposCategorias[p.id_equipoVisita][p.id_categoria]) {
                partidosEquiposCategorias[p.id_equipoVisita][p.id_categoria] = [];
            }
            partidosEquiposCategorias[p.id_equipoLocal][p.id_categoria].push(p);
            partidosEquiposCategorias[p.id_equipoVisita][p.id_categoria].push(p);
        });

        for (const exp of expulsiones) {
            const { id_jugador, id_partido, fechas_restantes, id_categoria } = exp;

            // Obtener el equipo del jugador y verificar en la tabla planteles
            const jugadorEnPlantel = await new Promise((resolve, reject) => {
                db.query('SELECT id_equipo, sancionado FROM planteles WHERE id_jugador = ? AND id_categoria = ?', [id_jugador, id_categoria], (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                });
            });

            if (!jugadorEnPlantel) continue;
            const { id_equipo, sancionado } = jugadorEnPlantel;

            // Obtener la fecha de la expulsión
            const fechaExpulsion = partidos.find(p => p.id_partido === id_partido).dia;

            // Filtrar los partidos jugados por el equipo después de la fecha de expulsión en la misma categoría
            const partidosJugados = partidosEquiposCategorias[id_equipo][id_categoria].filter(p => new Date(p.dia) > new Date(fechaExpulsion)).length;

            if (partidosJugados > 0) {
                // Disminuir las fechas restantes y actualizar la tabla expulsados
                const nuevasFechasRestantes = fechas_restantes - partidosJugados;

                await new Promise((resolve, reject) => {
                    db.query('UPDATE expulsados SET fechas_restantes = ? WHERE id_jugador = ? AND id_partido = ?', [nuevasFechasRestantes, id_jugador, id_partido], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });

                if (nuevasFechasRestantes <= 0) {
                    // Cambiar el estado a "N" (no sancionado) en la tabla planteles
                    await new Promise((resolve, reject) => {
                        db.query('UPDATE planteles SET sancionado = "N" WHERE id_jugador = ? AND id_categoria = ?', [id_jugador, id_categoria], (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        });
                    });

                    // Cambiar el estado a "I" (inactivo) en la tabla expulsados
                    await new Promise((resolve, reject) => {
                        db.query('UPDATE expulsados SET estado = "I" WHERE id_jugador = ? AND id_partido = ?', [id_jugador, id_partido], (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        });
                    });
                } else if (sancionado === 'N') {
                    // Si el jugador aún tiene fechas restantes y está en estado "N", cambiar a "S"
                    await new Promise((resolve, reject) => {
                        db.query('UPDATE planteles SET sancionado = "S" WHERE id_jugador = ? AND id_categoria = ?', [id_jugador, id_categoria], (err, results) => {
                            if (err) return reject(err);
                            resolve(results);
                        });
                    });
                }
            }
        }
        res.status(200).send('Expulsiones calculadas y actualizadas con éxito.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al calcular expulsiones.');
    }
};



module.exports = {
    getExpulsados,
    calcularExpulsiones
};
