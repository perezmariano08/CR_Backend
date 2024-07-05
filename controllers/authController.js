const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const db = require('../utils/db');

const checkEmail = (req, res) => {
    const { email } = req.body;
    db.query('SELECT COUNT(*) AS count FROM usuarios WHERE email = ?', [email], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        if (result[0].count > 0) return res.status(400).send('El correo electrónico ya está registrado');
        res.send('El correo electrónico está disponible');
    });
};

const checkDni = (req, res) => {
    const { dni } = req.body;
    db.query('SELECT COUNT(*) AS count FROM usuarios WHERE dni = ?', [dni], (err, result) => {
        if (err) return res.status(500).send('Error interno del servidor');
        if (result[0].count > 0) return res.status(400).send('El DNI ya está registrado');
        res.send('El DNI está disponible');
    });
};

const crearCuenta = (req, res) => {
    const { dni, nombre, apellido, fechaNacimiento, telefono, email, clave, equipoFav } = req.body;

    db.query(`SELECT id_equipo FROM equipos WHERE nombre = '${equipoFav}'`, (err, rows) => {
        if (err) {
            console.error("Error al buscar el ID del equipo:", err);
            return res.status(500).send("Error interno del servidor");
        }

        if (rows.length === 0) {
            return res.status(400).send("El equipo proporcionado no existe");
        }

        const idEquipo = rows[0].id_equipo;

        bcryptjs.genSalt(10, (err, salt) => {
            if (err) {
                console.error("Error al generar la sal:", err);
                return res.status(500).send("Error interno del servidor");
            }

        bcryptjs.hash(clave, salt, (err, hash) => {
            if (err) {
                console.error("Error al encriptar la contraseña:", err);
                return res.status(500).send("Error interno del servidor");
            }

            db.query(`INSERT INTO usuarios(dni, nombre, apellido, nacimiento, telefono, email, id_rol, clave, id_equipo_fav) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [dni, nombre, apellido, fechaNacimiento, telefono, email, 3, hash, idEquipo],
                (err, result) => {
                    if (err) {
                        console.error("Error al insertar el usuario en la tabla usuarios:", err);
                        return res.status(500).send("Error interno del servidor");
                    }
                    res.status(200).send("Cuenta creada exitosamente");
                }
            );
        });
    });
    });
}

const checkLogin = (req, res) => {
    const { dni, password } = req.body;
    db.query('SELECT * FROM usuarios WHERE dni = ?', [dni], (err, rows) => {
        if (err) return res.status(500).send('Error interno del servidor');
        if (rows.length === 0) return res.status(401).send('Usuario no encontrado');

        const user = rows[0];
        if (!bcryptjs.compareSync(password, user.clave)) return res.status(401).send('Contraseña incorrecta');

        const token = jsonwebtoken.sign({ user: user.dni }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('jwt', token, {   
            httpOnly: true, 
            secure: true, 
            sameSite: 'None', 
            maxAge: 3600000 });
        res.send({ id_rol: user.id_rol });
    });
};

const logout = (req, res) => {
    res.clearCookie("jwt", { path: "/" });
    res.send("Sesión cerrada exitosamente");
};

const checkAuthentication = (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).send('Usuario no autenticado');

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        db.query('SELECT * FROM usuarios WHERE dni = ?', [decoded.user], (err, result) => {
            if (err || result.length === 0) return res.status(401).send('Usuario no encontrado');
            const usuario = result[0];
            res.status(200).json({ message: "Usuario autenticado", usuario });
        });
    } catch (error) {
        console.error('Controlador checkAuthentication - error:', error);
        return res.status(500).send('Error interno del servidor');
    }
};

module.exports = {
    checkEmail,
    checkDni,
    crearCuenta,
    checkLogin,
    logout,
    checkAuthentication
};
