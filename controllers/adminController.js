const db = require('../utils/db');

const crearCategoria = (req, res) => {
    const { nombre, descripcion } = req.body;
    db.query('INSERT INTO categorias(nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Categoria registrada con éxito');
    });
};

const getCategorias = (req, res) => {
    db.query('SELECT * FROM categorias', (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const deleteCategoria = (req, res) => {
    const { id } = req.body;
    
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

const crearTorneo = (req, res) => {
    const { nombre, descripcion } = req.body;
    db.query('INSERT INTO torneos(nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Torneo registrado con éxito');
    });
};

const getTorneos = (req, res) => {
    db.query('SELECT * FROM torneos', (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const deleteTorneo = (req, res) => {
    const { id } = req.body;
    
    const sql = 'DELETE FROM torneos WHERE id_torneo = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando el torneo:', err);
            return res.status(500).send('Error eliminando el torneo');
        }
        res.status(200).send('Torneo eliminado correctamente');
    });
};

const crearSede = (req, res) => {
    const { nombre, descripcion } = req.body;
    db.query('INSERT INTO sedes(nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Sede registrada con éxito');
    });
};

const getSedes = (req, res) => {
    db.query('SELECT * FROM sedes', (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const deleteSede = (req, res) => {
    const { id } = req.body;
    
    const sql = 'DELETE FROM sedes WHERE id_sede = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la sede:', err);
            return res.status(500).send('Error eliminando la sede');
        }
        res.status(200).send('Sede eliminada correctamente');
    });
};

const crearAnio = (req, res) => {
    const { año, descripcion } = req.body;
    db.query('INSERT INTO años(año, descripcion) VALUES (?, ?)', [año, descripcion], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Año registrado con éxito');
    });
};

const importarAnio = (req, res) => {
    const años = req.body;
    if (!Array.isArray(años)) {
        return res.status(400).send('Invalid data format');
    }

    // Construye el query para insertar múltiples registros
    const values = años.map(({ año, descripcion }) => [año, descripcion]);
    const query = 'INSERT INTO años (año, descripcion) VALUES ?';

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al insertar datos en la base de datos');
        }
        res.status(200).send('Datos importados correctamente');
    });
};

const deleteAnio = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM años WHERE id_año = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando el año:', err);
            return res.status(500).send('Error eliminando el año');
        }
        res.status(200).send('Año eliminado correctamente');
    });
};

const getAnios = (req, res) => {
    db.query('SELECT * FROM años ORDER BY año DESC', (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const crearTemporada = (req, res) => {
    const { año, sede, categoria, torneo, division, descripcion } = req.body;
    db.query('INSERT INTO temporadas(id_torneo, id_categoria, id_año, id_sede, id_division, descripcion) VALUES (?, ?, ?, ?, ?, ?)', [torneo, categoria, año, sede, division, descripcion], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Temporada registrada con éxito');
    });
};

const getTemporadas = (req, res) => {
    db.query(`SELECT 
        id_temporada, 
        torneos.nombre AS torneo, 
        categorias.nombre AS categoria, 
        años.año, 
        sedes.nombre AS sede, 
        divisiones.nombre AS division,
        temporadas.descripcion
            FROM temporadas 
            INNER JOIN torneos ON temporadas.id_torneo = torneos.id_torneo 
            INNER JOIN categorias ON temporadas.id_categoria = categorias.id_categoria 
            INNER JOIN años ON temporadas.id_año = años.id_año 
            INNER JOIN sedes ON temporadas.id_sede = sedes.id_sede
            INNER JOIN divisiones ON temporadas.id_division = divisiones.id_division`, 
    (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const deleteTemporada = (req, res) => {
    const { id } = req.body;
    
    // Sentencia SQL para eliminar el año por ID
    const sql = 'DELETE FROM temporadas WHERE id_temporada = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la temporada:', err);
            return res.status(500).send('Error eliminando la temporada');
        }
        res.status(200).send('Temporada eliminado correctamente');
    });
};


const crearEquipo = (req, res) => {
    const { nombre, img, id_categoria, descripcion } = req.body;
    db.query('INSERT INTO equipos(nombre, id_categoria, descripcion, img) VALUES (?, ?, ?, ?)', [nombre, id_categoria, descripcion, img], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Temporada registrada con éxito');
    });
};




const getDivisiones = (req, res) => {
    db.query('SELECT * FROM divisiones', (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};

const crearDivision = (req, res) => {
    const { nombre, descripcion } = req.body;
    db.query('INSERT INTO divisiones(nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send('Categoria registrada con éxito');
    });
};



const getUsuarios = (req, res) => {
    db.query(
        `SELECT 
            usuarios.id_usuario, 
            usuarios.dni, 
            CONCAT(UPPER(usuarios.apellido), ', ', usuarios.nombre) AS usuario, 
            usuarios.nacimiento, 
            usuarios.telefono, 
            roles.nombre AS rol, 
            equipos.nombre AS equipo, 
            usuarios.estado,
            usuarios.img
        FROM 
            usuarios 
        INNER JOIN 
            roles ON roles.id_rol = usuarios.id_rol 
        INNER JOIN 
            equipos ON equipos.id_equipo = usuarios.id_equipo_fav;`
    ,(err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        res.send(result);
    });
};



module.exports = {
    crearCategoria,
    getCategorias,
    deleteCategoria,
    crearTorneo,
    getTorneos,
    deleteTorneo,
    crearSede,
    getSedes,
    deleteSede,
    crearAnio,
    importarAnio,
    deleteAnio,
    getAnios,
    crearTemporada,
    getTemporadas,
    deleteTemporada,
    crearEquipo,
    getDivisiones,
    crearDivision,
    getUsuarios
};
