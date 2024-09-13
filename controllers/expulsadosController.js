const db = require('../utils/db');

const getExpulsados = (req, res) => {
    db.query(
    `SELECT
        e.id_expulsion,
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

// const calcularExpulsiones = async (req, res) => {
//     try {
//         console.log('Iniciando cálculo de expulsiones...');

//         // Obtener todas las expulsiones activas con fechas restantes mayores a 0
//         const expulsiones = await new Promise((resolve, reject) => {
//             db.query('SELECT * FROM expulsados WHERE fechas_restantes > 0 AND estado = "A"', (err, results) => {
//                 if (err) {
//                     console.error('Error al obtener expulsiones:', err);
//                     return reject(err);
//                 }
//                 resolve(results);
//             });
//         });

//         // Obtener todos los partidos finalizados
//         const partidos = await new Promise((resolve, reject) => {
//             db.query('SELECT id_partido, id_equipoLocal, id_equipoVisita, jornada, dia, id_categoria FROM partidos WHERE estado = "F"', (err, results) => {
//                 if (err) {
//                     console.error('Error al obtener partidos:', err);
//                     return reject(err);
//                 }
//                 resolve(results);
//             });
//         });

//         for (const exp of expulsiones) {
//             const { id_jugador, id_partido, fechas, fechas_restantes } = exp;

//             // Obtener el partido de la expulsión
//             const partidoExpulsion = partidos.find(p => p.id_partido === id_partido);
//             if (!partidoExpulsion) continue;

//             const id_categoria = partidoExpulsion.id_categoria;
//             const fechaExpulsion = partidoExpulsion.dia;

//             // Obtener el equipo del jugador al momento de la expulsión
//             const jugadorEnPlantel = await new Promise((resolve, reject) => {
//                 db.query('SELECT id_equipo FROM planteles WHERE id_jugador = ? AND id_categoria = ?', [id_jugador, id_categoria], (err, results) => {
//                     if (err) {
//                         return reject(err);
//                     }
//                     resolve(results[0]);
//                 });
//             });

//             if (!jugadorEnPlantel) continue;

//             const { id_equipo } = jugadorEnPlantel;

//             // Filtrar los partidos del equipo posteriores a la expulsión
//             const partidosJugados = partidos.filter(p => 
//                 (p.id_equipoLocal === id_equipo || p.id_equipoVisita === id_equipo) &&
//                 p.id_categoria === id_categoria &&
//                 new Date(p.dia) > new Date(fechaExpulsion)
//             ).length;

//             if (partidosJugados > 0) {
//                 // Calcular las nuevas fechas restantes
//                 const nuevasFechasRestantes = Math.max(fechas_restantes - partidosJugados, 0);

//                 // Actualizar las fechas restantes de la expulsión
//                 await new Promise((resolve, reject) => {
//                     db.query('UPDATE expulsados SET fechas_restantes = ? WHERE id_jugador = ? AND id_expulsion = ?', [nuevasFechasRestantes, id_jugador, exp.id_expulsion], (err, results) => {
//                         if (err) {
//                             return reject(err);
//                         }
//                         resolve(results);
//                     });
//                 });

//                 // Si no quedan fechas restantes, actualizar el estado del jugador en planteles y la expulsión
//                 if (nuevasFechasRestantes <= 0) {
//                     await new Promise((resolve, reject) => {
//                         db.query('UPDATE planteles SET sancionado = "N" WHERE id_jugador = ? AND id_categoria = ?', [id_jugador, id_categoria], (err, results) => {
//                             if (err) {
//                                 return reject(err);
//                             }
//                             resolve(results);
//                         });
//                     });

//                     await new Promise((resolve, reject) => {
//                         db.query('UPDATE expulsados SET estado = "I" WHERE id_jugador = ? AND id_expulsion = ?', [id_jugador, exp.id_expulsion], (err, results) => {
//                             if (err) {
//                                 return reject(err);
//                             }
//                             resolve(results);
//                         });
//                     });
//                 } else {
//                     // Si quedan fechas restantes y el jugador no está sancionado, actualizar el estado en planteles
//                     const sancionado = await new Promise((resolve, reject) => {
//                         db.query('SELECT sancionado FROM planteles WHERE id_jugador = ? AND id_categoria = ?', [id_jugador, id_categoria], (err, results) => {
//                             if (err) {
//                                 return reject(err);
//                             }
//                             resolve(results[0].sancionado);
//                         });
//                     });

//                     if (sancionado === 'N') {
//                         await new Promise((resolve, reject) => {
//                             db.query('UPDATE planteles SET sancionado = "S" WHERE id_jugador = ? AND id_categoria = ?', [id_jugador, id_categoria], (err, results) => {
//                                 if (err) {
//                                     return reject(err);
//                                 }
//                                 resolve(results);
//                             });
//                         });
//                     }
//                 }
//             }
//         }

//         res.status(200).send('Expulsiones calculadas y actualizadas con éxito.');
//     } catch (error) {
//         console.error('Error al calcular expulsiones:', error);
//         res.status(500).send('Error al calcular expulsiones.');
//     }
// };

const calcularExpulsiones = async (req, res) => {
    try {
        // Primera consulta: Actualizar la columna fechas_restantes y el estado en la tabla expulsados
        await new Promise((resolve, reject) => {
            const query1 = `
                UPDATE expulsados e
                JOIN (
                    WITH partido_expulsion AS (
                        SELECT 
                            e.id_expulsion,
                            e.id_jugador,
                            e.id_partido,
                            p.dia AS fecha_expulsion,
                            p.id_categoria,
                            CASE 
                                WHEN p.id_equipoLocal = pl.id_equipo THEN p.id_equipoLocal
                                WHEN p.id_equipoVisita = pl.id_equipo THEN p.id_equipoVisita
                            END AS id_equipo
                        FROM 
                            expulsados e
                        JOIN 
                            partidos p ON e.id_partido = p.id_partido
                        JOIN 
                            planteles pl ON e.id_jugador = pl.id_jugador AND p.id_categoria = pl.id_categoria
                    ),
                    partidos_jugados AS (
                        SELECT 
                            pe.id_jugador,
                            pe.id_equipo,
                            COUNT(pf.id_partido) AS partidos_jugados
                        FROM 
                            partido_expulsion pe
                        JOIN 
                            partidos pf ON pf.id_categoria = pe.id_categoria 
                                AND pf.dia > pe.fecha_expulsion
                                AND (pf.id_equipoLocal = pe.id_equipo OR pf.id_equipoVisita = pe.id_equipo)
                                AND pf.estado = 'F'
                        GROUP BY 
                            pe.id_jugador, 
                            pe.id_equipo
                    )
                    SELECT 
                        e.id_expulsion,
                        e.id_jugador,
                        GREATEST(0, e.fechas - pj.partidos_jugados) AS fechas_restantes_actualizadas
                    FROM 
                        expulsados e
                    JOIN 
                        partido_expulsion pe ON e.id_jugador = pe.id_jugador AND e.id_expulsion = pe.id_expulsion
                    JOIN 
                        partidos_jugados pj ON pe.id_jugador = pj.id_jugador
                ) calc
                ON e.id_expulsion = calc.id_expulsion
                SET 
                    e.fechas_restantes = calc.fechas_restantes_actualizadas,
                    e.estado = CASE WHEN calc.fechas_restantes_actualizadas > 0 THEN 'A' ELSE e.estado END;
            `;
            db.query(query1, (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });

        // Segunda consulta: Actualizar la tabla planteles en función del estado de la expulsión
        await new Promise((resolve, reject) => {
            const query2 = `
                UPDATE planteles pl
                JOIN expulsados e ON pl.id_jugador = e.id_jugador
                SET 
                    pl.sancionado = CASE 
                        WHEN e.estado = 'A' THEN 'S' 
                        ELSE 'N' 
                    END
                WHERE e.estado IS NOT NULL;
            `;
            db.query(query2, (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results);
            });
        });

        // Enviar respuesta exitosa
        res.status(200).send('Expulsiones calculadas y actualizadas con éxito.');
    } catch (error) {
        // Manejo de errores
        console.error('Error al calcular expulsiones:', error);
        res.status(500).send('Error al calcular expulsiones.');
    }
};


module.exports = {
    getExpulsados,
    calcularExpulsiones
};
