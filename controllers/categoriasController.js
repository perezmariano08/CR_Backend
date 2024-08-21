const db = require('../utils/db');

const getCategorias = (req, res) => {
    db.query(`
        SELECT
            c.genero,
            c.tipo_futbol,
            c.duracion_tiempo,
            c.duracion_entretiempo,
            c.id_categoria,
            c.id_edicion, 
            c.nombre AS nombre,
            CONCAT(
                IFNULL((SELECT COUNT(*) FROM partidos p WHERE p.id_categoria = c.id_categoria AND p.estado = 'F'), 0),
                ' / ',
                IFNULL((SELECT COUNT(*) FROM partidos p WHERE p.id_categoria = c.id_categoria), 0)
            ) AS partidos,
            IFNULL((SELECT COUNT(*) FROM equipos e WHERE e.id_categoria = c.id_categoria), 0) AS equipos,
            CONCAT(
                IFNULL((SELECT COUNT(*) FROM jugadores j WHERE j.id_categoria = c.id_categoria), 0),
                ' ',
                IFNULL(
                    CASE 
                        WHEN c.genero = 'F' THEN 
                            CASE WHEN (SELECT COUNT(*) FROM jugadores j WHERE j.id_categoria = c.id_categoria) = 1 THEN 'jugadora' ELSE 'jugadoras' END
                        ELSE 
                            CASE WHEN (SELECT COUNT(*) FROM jugadores j WHERE j.id_categoria = c.id_categoria) = 1 THEN 'jugador' ELSE 'jugadores' END
                    END,
                    ''
                )
            ) AS jugadores,
            CASE
                WHEN EXISTS (SELECT 1 FROM partidos p WHERE p.id_categoria = c.id_categoria AND p.estado = 'F') THEN 'JUGANDO'
                ELSE 'SIN INICIAR'
            END AS estado
        FROM 
            categorias c
        ORDER BY 
            c.id_categoria DESC`,
        (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const crearCategoria = (req, res) => {
    const { id_edicion,	nombre,	genero,	tipo_futbol, duracion_tiempo, duracion_entretiempo } = req.body;
    db.query(`INSERT INTO 
        categorias(id_edicion, nombre, genero, tipo_futbol, duracion_tiempo, duracion_entretiempo) 
        VALUES (?, ?, ?, ?, ?, ?)`, [id_edicion, nombre, genero, tipo_futbol, duracion_tiempo, duracion_entretiempo], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Categoria registrada con éxito');
    });
};

const actualizarCategoria = (req, res) => {
    const { nombre,	genero,	tipo_futbol, duracion_tiempo, duracion_entretiempo, id_categoria } = req.body;

    // Validar que id_usuario esté presente
    if (!id_categoria) {
        return res.status(400).send('ID de edicion es requerido');
    }
    // Construir la consulta SQL
    const sql = `
        UPDATE categorias
        SET 
            nombre = ?, 
            genero = ?, 
            tipo_futbol = ?, 
            duracion_tiempo = ?, 
            duracion_entretiempo = ?
        WHERE id_categoria = ?
    `;

    // Ejecutar la consulta
    db.query(sql, [nombre, genero, tipo_futbol, duracion_tiempo, duracion_entretiempo, id_categoria], (err, result) => {
        if (err) {
            return res.status(500).send('Error interno del servidor');
        }
        res.send('Categoria actualizada exitosamente');
    });
};

const eliminarCategoria = (req, res) => {
    const { id } = req.body;
    console.log(id);
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM categorias WHERE id_categoria = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la categoria:', err);
            return res.status(500).send('Error eliminando la categoria');
        }
        res.status(200).send('Categoria eliminada correctamente');
    });
};

module.exports = {
    getCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};