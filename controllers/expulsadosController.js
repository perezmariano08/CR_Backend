const db = require('../utils/db');

const getExpulsados = (req, res) => {
    db.query(
        `SELECT
            CONCAT(UPPER(j.apellido), ', ', j.nombre) AS jugador,
            c.nombre AS categoria,
            e.fechas,
            e.fechas_restantes,
            e.multa,
            eq.id_equipo
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
        WHERE
            p.id_categoria = pl.id_categoria;`
    , (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const calcularExpulsiones = async (req, res) => {
    try {
        // Traer solo las expulsiones activas
        const expulsiones = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM expulsados WHERE estado = "A"', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Traer todos los partidos finalizados
        const partidos = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM partidos WHERE estado = "F"', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Crear un mapa de partidos por equipo
        const partidosEquipos = {};
        partidos.forEach(p => {
            if (!partidosEquipos[p.id_equipoLocal]) {
                partidosEquipos[p.id_equipoLocal] = [];
            }
            if (!partidosEquipos[p.id_equipoVisita]) {
                partidosEquipos[p.id_equipoVisita] = [];
            }
            partidosEquipos[p.id_equipoLocal].push(p);
            partidosEquipos[p.id_equipoVisita].push(p);
        });

        // Obtener información de los jugadores
        const jugadores = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM jugadores', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        for (const exp of expulsiones) {
            const { id_jugador, id_partido, fechas } = exp;

            // Encontrar el jugador para obtener su equipo
            const jugador = jugadores.find(j => j.id_jugador === id_jugador);
            if (!jugador) continue;

            const equipoDelJugador = jugador.id_equipo;

            // Filtrar y contar los partidos jugados por el equipo después del partido de la expulsión
            const partidosJugados = partidosEquipos[equipoDelJugador].filter(p => p.id_partido > id_partido).length;

            if (partidosJugados >= fechas) {
                await new Promise((resolve, reject) => {
                    // Actualizar el estado del jugador solo si ya está sancionado
                    db.query('UPDATE jugadores SET sancionado = "N" WHERE id_jugador = ? AND sancionado = "S"', [id_jugador], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });

                await new Promise((resolve, reject) => {
                    db.query('UPDATE expulsados SET estado = "I" WHERE id_jugador = ? AND id_partido = ?', [id_jugador, id_partido], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
            }
        }

        console.log('Expulsiones calculadas y actualizadas con éxito.');
        res.status(200).send('Expulsiones calculadas y actualizadas con éxito.');
    } catch (error) {
        console.error('Error al calcular expulsiones:', error);
        res.status(500).send('Error al calcular expulsiones.');
    }
};



module.exports = {
    getExpulsados,
    calcularExpulsiones
};
