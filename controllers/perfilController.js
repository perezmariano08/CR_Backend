const bcryptjs = require('bcryptjs');
const db = require('../utils/db');
const mailer = require('../utils/mailer');

const editarPerfil = async (req, res) => {
    try {
        const { id_usuario, dni, nombre, apellido, fechaNacimiento, telefono, email, clave } = req.body;

        // Realizar la consulta a la base de datos para verificar si el usuario existe
        db.query('SELECT * FROM usuarios WHERE dni = ?', [dni], async (err, result) => {
            if (err) return res.status(500).send('Error al consultar la base de datos');
            if (result.length === 0) return res.status(401).send('Usuario no encontrado');
            
            const user = result[0];
            console.log(user);

            // Preparar un objeto con los campos que se van a actualizar
            let camposActualizados = {};

            if (dni && dni !== user.dni) {
                camposActualizados.dni = dni;
            }

            if (nombre && nombre !== user.nombre) {
                camposActualizados.nombre = nombre;
            }

            if (apellido && apellido !== user.apellido) {
                camposActualizados.apellido = apellido;
            }

            if (fechaNacimiento && fechaNacimiento !== user.nacimiento) {
                camposActualizados.nacimiento = fechaNacimiento;
            }

            if (telefono && telefono !== user.telefono) {
                camposActualizados.telefono = telefono;
            }

            // Manejo de la clave (encriptación si se proporciona una nueva y es diferente de la actual)
            if (clave) {
                const isMatch = await bcryptjs.compare(clave, user.clave);
                if (!isMatch) {
                    const salt = await bcryptjs.genSalt(10);
                    const hashedPassword = await bcryptjs.hash(clave, salt);
                    camposActualizados.clave = hashedPassword;
                }
            }

            // Manejo del email (verificación antes de actualizar)
            if (email && email !== user.email) {
                await mailer.sendVerificationChangeEmail(email, dni, nombre);
                camposActualizados.email = email;
                camposActualizados.estado = 'P';
            }

            // Si no hay cambios, retornar sin actualizar
            if (Object.keys(camposActualizados).length === 0) {
                return res.status(200).send("No se realizaron cambios, los datos son iguales");
            }

            // Agregar la fecha de actualización
            camposActualizados.fecha_actualizacion = new Date();

            // Construir la query de actualización dinámica
            let query = 'UPDATE usuarios SET ';
            let queryParams = [];
            for (const [key, value] of Object.entries(camposActualizados)) {
                query += `${key} = ?, `;
                queryParams.push(value);
            }
            query = query.slice(0, -2) + ' WHERE id_usuario = ?';
            queryParams.push(id_usuario);

            // Ejecutar la actualización
            db.query(query, queryParams, (err, updateResult) => {
                if (err) return res.status(500).send("Error al actualizar el perfil");
                if (updateResult.affectedRows === 0) {
                    return res.status(400).send("No se pudo actualizar el perfil");
                }

                res.status(200).send("Perfil actualizado exitosamente");
            });
        });

    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        res.status(500).send("Error interno del servidor");
    }
};

const getNovedades = async (req, res) => {
    const {id_rol} = req.query;

    db.query('SELECT * FROM novedades WHERE id_rol = ?', [id_rol], (err, result) => {
        if (err) {
            return res.status(400).send(err.sqlMessage);
        }

        if (result.length === 0) {
            return res.status(500).send('No hay novedades para ese rol')
        }
        res.status(200).json(result)
    })
}

module.exports = {
    editarPerfil,
    getNovedades
};
