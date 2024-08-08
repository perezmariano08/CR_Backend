const db = require('../utils/db');

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

const deleteDivision = (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID de división no proporcionado' });
    }

    // Sentencia SQL para eliminar la división por ID
    const sql = 'DELETE FROM divisiones WHERE id_division = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando la división:', err);
            return res.status(500).json({ message: 'Error eliminando la división' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'División no encontrada' });
        }
        res.status(200).json({ message: 'División eliminada correctamente' });
    });
};


const importarDivision = (req, res) => {
    const divisiones = req.body;
    if (!Array.isArray(divisiones)) {
        return res.status(400).send('Invalid data format');
    }

    // Construye el query para insertar múltiples registros
    const values = divisiones.map(({ nombre, descripcion }) => [nombre, descripcion]);
    const query = 'INSERT INTO divisiones (nombre, descripcion) VALUES ?';

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al insertar datos en la base de datos');
        }
        res.status(200).send('Datos importados correctamente');
    });
};


module.exports = {
    crearDivision,
    getDivisiones,
    deleteDivision,
    importarDivision
};
