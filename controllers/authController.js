const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const db = require('../utils/db');
const mailer = require('../utils/mailer');
const { URL_FRONT } = require('../utils/utils');

const checkEmail = (req, res) => {
    const { email, bandera } = req.body;

    if (!email) {
        return res.status(400).send('Email no proporcionado');
    }

    db.query('SELECT COUNT(*) AS count FROM usuarios WHERE email = ?', [email], (err, result) => {
        if (err) {
            console.error('Error en la consulta a la base de datos:', err);
            return res.status(500).send('Error interno del servidor');
        }

        console.log('Resultado de la consulta:', result);

        if (!bandera) {
            // Si bandera es false, verifica si el email ya está registrado
            if (result.length > 0 && result[0].count > 0) {
                return res.status(400).send('El correo electrónico ya está registrado');
            } else {
                return res.status(200).send('El correo electrónico está disponible');
            }
        } else {
            // Si bandera es true, verifica si el email está registrado
            if (result.length > 0 && result[0].count > 0) {
                return res.status(200).send('El correo electrónico está registrado');
            } else {
                return res.status(400).send('Correo electrónico no encontrado en la base de datos');
            }
        }
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
    const { dni, nombre, apellido, fechaNacimiento, telefono, email, clave, rol } = req.body;
    const fecha_creacion = new Date(); // Obtener la fecha actual

    // Verificar que todos los campos requeridos estén presentes
    if (!dni || !nombre || !apellido || !fechaNacimiento || !telefono || !email || !clave || !rol) {
        return res.status(400).send("Faltan datos requeridos");
    }

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

            db.query(
                `INSERT INTO usuarios(dni, nombre, apellido, nacimiento, telefono, email, id_rol, clave, fecha_creacion, fecha_actualizacion, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [dni, nombre, apellido, fechaNacimiento, telefono, email, parseInt(rol), hash, fecha_creacion, null, 'I'],
                async (err, result) => {
                    if (err) {
                        console.error("Error al insertar el usuario en la tabla usuarios:", err);
                        return res.status(500).send("Error interno del servidor");
                    }

                    // Intentar enviar el correo antes de enviar la respuesta
                    if (email) {
                        try {
                            await mailer.sendVerificationEmail(email, dni, nombre);
                        } catch (error) {
                            console.error('Error al enviar el correo:', error);
                            return res.status(500).json({ message: 'Hubo un error en el envío del mail de autenticación' });
                        }
                    }
                    
                    // Solo enviar una vez la respuesta
                    res.status(200).send("Cuenta creada exitosamente.");
                }
            );
        });
    });
};

const checkLogin = (req, res) => {
    const { dni, password } = req.body;

    db.query('SELECT * FROM usuarios WHERE dni = ?', [dni], (err, rows) => {
        if (err) return res.status(500).send('Error interno del servidor');

        if (rows.length === 0) return res.status(400).send('Usuario no encontrado');

        const user = rows[0];
        if (user.id_rol === null) return res.status(401).send('Usuario no autorizado');

        if (user.estado !== 'A') return res.status(403).send('Cuenta no activada');

        if (!bcryptjs.compareSync(password, user.clave)) return res.status(405).send('Contraseña incorrecta');

        const token = jsonwebtoken.sign({ user: user.dni }, 'textosecretoDECIFRADO', { expiresIn: '30d' });

        const logEntry = {
            user_id: user.id_usuario,
            action: 'Inicio de sesión',
            timestamp: new Date().toISOString(),
            endpoint: '/auth/check-login',
            request_data: JSON.stringify({ dni }),
            response_status: 200,
        };

        db.query('INSERT INTO logs_auditoria SET ?', logEntry, (logErr) => {
            if (logErr) console.error('Error al registrar log:', logErr);
        });

        res.status(200).json({ token, id_rol: user.id_rol, id_user: user.id_usuario });
    });
};

const logout = (req, res) => {
    res.send("Sesión cerrada exitosamente");
};

const checkAuthentication = (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).send('Usuario no autenticado');

        const decoded = jsonwebtoken.verify(token, 'textosecretoDECIFRADO');
        db.query('SELECT * FROM usuarios WHERE dni = ?', [decoded.user], (err, result) => {
            if (err || result.length === 0) return res.status(401).send('Usuario no encontrado');
            
            const usuario = result[0];
            
            res.status(200).json({ message: "Usuario autenticado", usuario });
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send('Token expirado');
        }
        console.error('Controlador checkAuthentication - error:', error);
        return res.status(500).send('Error interno del servidor');
    }
};

const activarCuenta = (req, res) => {
    const { dni } = req.query;

    if (!dni) {
        console.log('Falta DNI');
        return res.status(400).send('Falta DNI');
    }

    db.query('UPDATE usuarios SET estado = ? WHERE dni = ?', ['A', dni], (err, result) => {
        if (err) {
            console.error('Error al actualizar el estado del usuario:', err);
            return res.status(500).send('Error interno del servidor');
        }

        console.log(`Resultado de la actualización: ${result.affectedRows}`);

        if (result.affectedRows === 0) {
            console.log('El usuario no existe o ya está activado');
            return res.status(400).send('El usuario no existe o ya está activado');
        }

        console.log('Redirigiendo a login...');
        res.redirect(`${URL_FRONT}/login?activada=true`);
    });
};

const activarCambioEmail = (req, res) => {
    const { dni } = req.query;

    if (!dni) {
        console.log('Falta DNI');
        return res.status(400).send('Falta DNI');
    }

    db.query('UPDATE usuarios SET estado = ? WHERE dni = ?', ['A', dni], (err, result) => {
        if (err) {
            console.error('Error al actualizar el estado del usuario:', err);
            return res.status(500).send('Error interno del servidor');
        }

        console.log(`Resultado de la actualización: ${result.affectedRows}`);
        
        if (result.affectedRows === 0) {
            console.log('El usuario no existe o ya está activado');
            return res.status(400).send('El usuario no existe o ya está activado');
        }

        res.redirect(`${URL_FRONT}/confirm-email-change`);

    });
};

const forgotPasswordHandler = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Falta Email');
    }

    try {
        db.query('SELECT dni, email FROM usuarios WHERE email = ?', [email], async (err, result) => {
            if (err) {
                console.error('Error al encontrar el email del usuario:', err);
                return res.status(500).send('Error interno del servidor');
            }

            if (result.length === 0) {
                return res.status(404).send('Email no encontrado');
            }

            const { dni, email: userEmail } = result[0];

            // Generar y almacenar el token de recuperación
            const tokenExpiration = Date.now() + 3 * 60 * 1000; // 3 minutos desde ahora
            const resetToken = jsonwebtoken.sign({ dni }, 'your-secret-key', { expiresIn: '3m' });

            db.query('UPDATE usuarios SET reset_token = ?, reset_token_expiration = ? WHERE dni = ?', 
            [resetToken, tokenExpiration, dni], async (err) => {
                if (err) {
                    console.error('Error al guardar el token de recuperación en la base de datos:', err);
                    return res.status(500).send('Error interno del servidor');
                }

                try {
                    await mailer.forgotPassword(userEmail, dni);
                    return res.status(200).send("Mail de recuperación enviado con éxito");
                } catch (mailError) {
                    console.error('Error al enviar el correo:', mailError);
                    return res.status(500).json({ message: 'Hubo un error en el envío del mail de recuperación' });
                }
            });
        });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ message: 'Hubo un error en el envío del mail de recuperación' });
    }
};

const changeNewPassword = (req, res) => {
    const { clave, token } = req.body;

    if (!clave || !token) {
        return res.status(400).send("Clave y token son requeridos");
    }

    // Verificar el token
    jsonwebtoken.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(400).send("Token inválido o expirado");
        }

        const { dni } = decoded;

        // Verificar si el token ha expirado
        db.query('SELECT reset_token_expiration FROM usuarios WHERE dni = ?', [dni], (err, results) => {
            if (err) {
                console.error("Error al consultar la base de datos:", err);
                return res.status(500).send("Error interno del servidor");
            }

            if (results.length === 0) {
                return res.status(404).send("Usuario no encontrado");
            }

            const resetTokenExpiration = results[0].reset_token_expiration;
            const currentTime = Date.now();

            if (currentTime > resetTokenExpiration) {
                return res.status(400).send("El token ha expirado");
            }

            // Si el token es válido y no ha expirado, actualizar la contraseña
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

                    db.query('UPDATE usuarios SET clave = ?, reset_token = NULL, reset_token_expiration = NULL WHERE dni = ?', 
                    [hash, dni], (err, results) => {
                        if (err) {
                            console.error("Error al actualizar la contraseña en la base de datos:", err);
                            return res.status(500).send("Error interno del servidor");
                        }

                        if (results.affectedRows === 0) {
                            return res.status(404).send("Usuario no encontrado");
                        }

                        res.status(200).send("Contraseña actualizada exitosamente");
                    });
                });
            });
        });
    });
};

module.exports = {
    checkEmail,
    checkDni,
    crearCuenta,
    checkLogin,
    logout,
    checkAuthentication,
    activarCuenta,
    forgotPasswordHandler,
    changeNewPassword,
    activarCambioEmail
};
