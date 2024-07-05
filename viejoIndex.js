// const bcryptjs = require("bcryptjs");
// const jsonwebtoken = require("jsonwebtoken")
// const dotenv = require("dotenv")
// const cookieParser = require('cookie-parser');
// const express = require("express")
// const mysql = require("mysql")
// const cors = require("cors")
// const app = express()

// const { revisarCookie, revisarAdmin, revisarPlanillero } = require("./middlewares/auth");

// dotenv.config();

// app.use(cookieParser());

// app.use(express.json())

// app.use(cors({
//     origin: ['https://cr-sistema.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }));

// const port = process.env.PORT || 3001

// const db = mysql.createConnection({
//     host: "srv1196.hstgr.io",
//     user: "u436441116_mariano",
//     password: "T+n8FOHAx?5u",
//     database: "u436441116_database"
// })

// // --------------------------ADMIN----------------------------//

// // CATEGORIAS
// app.post("/crear-categoria", (req, res)=>{
//     const nombre = req.body.nombre
//     const descripcion = req.body.descripcion

//     db.query(`INSERT INTO categorias(nombre, descripcion) VALUES ('${nombre}','${descripcion}')`,
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send("Categoria registrada con exito")
//             }
//         }
//     )
// })

// app.get("/categorias", (req, res)=>{
//     db.query('SELECT * FROM categorias',
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send(result)
//             }
//         }
//     )
// })

// // TORNEOS
// app.post("/crear-torneo", (req, res)=>{
//     const nombre = req.body.nombre
//     const descripcion = req.body.descripcion

//     db.query(`INSERT INTO torneos(nombre, descripcion) VALUES ('${nombre}','${descripcion}')`,
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send("Torneo registrado con exito")
//             }
//         }
//     )
// })

// app.get("/torneos", (req, res)=>{
//     db.query('SELECT * FROM torneos',
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send(result)
//             }
//         }
//     )
// })

// // SEDES
// app.post("/crear-sede", (req, res)=>{
//     const nombre = req.body.nombre
//     const descripcion = req.body.descripcion

//     db.query(`INSERT INTO sedes(nombre, descripcion) VALUES ('${nombre}','${descripcion}')`,
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send("Torneo registrado con exito")
//             }
//         }
//     )
// })

// app.get("/sedes", (req, res)=>{
//      db.query('SELECT * FROM sedes',
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send(result)
//             }
//         }
//     )
// })

// //AÑOS
// app.post("/crear-anio", (req, res)=>{
//     const año = req.body.año
//     const descripcion = req.body.descripcion

//     db.query(`INSERT INTO años(año, descripcion) VALUES ('${año}','${descripcion}')`,
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send("Torneo registrado con exito")
//             }
//         }
//     )
// })

// app.get("/anios", (req, res)=>{
//      db.query('SELECT * FROM años ORDER BY año DESC',
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send(result)
//             }
//         }
//     )
// })

// // TEMPORADAS
// app.post("/crear-temporada", (req, res)=>{
//     const año = req.body.año
//     const sede = req.body.sede
//     const categoria = req.body.categoria
//     const torneo = req.body.torneo
//     const descripcion = req.body.descripcion

//     db.query(`INSERT INTO temporadas(id_torneo, id_categoria, id_año, id_sede, descripcion) VALUES ('${torneo}','${categoria}','${año}','${sede}','${descripcion}')`,
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send("Torneo registrado con exito")
//             }
//         }
//     )
// })

// app.get("/temporadas", (req, res)=>{
//     db.query('SELECT id_temporada, torneos.nombre AS torneo, categorias.nombre AS categoria, años.año, sedes.nombre AS sede, temporadas.descripcion FROM temporadas INNER JOIN torneos ON temporadas.id_torneo = torneos.id_torneo INNER JOIN categorias ON temporadas.id_categoria = categorias.id_categoria INNER JOIN años ON temporadas.id_año = años.id_año INNER JOIN sedes ON temporadas.id_sede = sedes.id_sede',
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send(result)
//             }
//         }
//     )
// })

// //---------------------------REGISTER-------------------------//

// // EMAIL
// app.post("/check-email", (req, res) => {
//     const email = req.body.email;
//     db.query("SELECT COUNT(*) AS count FROM usuarios WHERE email = ?", [email], (err, result) => {
//         if (err) {
//             console.error("Error al verificar el correo electrónico:", err);
//             res.status(500).send("Error interno del servidor");
//         } else {
//             const count = result[0].count;
//             if (count > 0) {
//                 res.status(400).send("El correo electrónico ya está registrado");
//             } else {
//                 res.send("El correo electrónico está disponible");
//             }
//         }
//     });
// });

// app.get("/emails", (req, res) => {
//     db.query("SELECT email FROM usuarios", (err, result) => {
//         if (err) {
//             console.error("Error al obtener los correos electrónicos:", err);
//             res.status(500).send("Error interno del servidor");
//         } else {
//             res.send(result);
//         }
//     });
// });

// // DNI
// app.post('/check-dni', (req, res) => {
//     const dni = req.body.dni;
//     db.query('SELECT COUNT(*) as count FROM usuarios WHERE dni = ?', [dni], (err, result) => {
//         if (err) {
//             console.error('Error al verificar el DNI');
//             res.status(500).send('Error interno del servidor')
//         } else {
//             const count = result[0].count;
//             if (count > 0) {
//                 res.status(400).send('El DNI ya esta registrado')
//             } else {
//                 res.send('El DNI esta disponible')
//             }
//         }
//     })
// })

// app.get('/dni', (req, res) => {
//     db.query('SELECT dni FROM usuarios', (err, result) => {
//         if (err) {
//             console.error('Error al obtener los DNI', err);
//             res.status(500).send('Error interno del servidor')
//         } else {
//             res.send(result)
//         }
//     })
// })

// //CUENTA Y PASSWORD
// app.post('/crear-cuenta', (req, res) => {
//     const { dni, nombre, apellido, fechaNacimiento, telefono, email, clave, equipoFav } = req.body;

//     db.query(`SELECT id_equipo FROM equipos WHERE nombre = '${equipoFav}'`, (err, rows) => {
//         if (err) {
//             console.error("Error al buscar el ID del equipo:", err);
//             return res.status(500).send("Error interno del servidor");
//         }

//         if (rows.length === 0) {
//             return res.status(400).send("El equipo proporcionado no existe");
//         }

//         const idEquipo = rows[0].id_equipo;

//         bcryptjs.genSalt(10, (err, salt) => {
//             if (err) {
//                 console.error("Error al generar la sal:", err);
//                 return res.status(500).send("Error interno del servidor");
//             }

//             bcryptjs.hash(clave, salt, (err, hash) => {
//                 if (err) {
//                     console.error("Error al encriptar la contraseña:", err);
//                     return res.status(500).send("Error interno del servidor");
//                 }

//                 db.query(`INSERT INTO usuarios(dni, nombre, apellido, nacimiento, telefono, email, clave, id_equipo_fav) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//                     [dni, nombre, apellido, fechaNacimiento, telefono, email, hash, idEquipo],
//                     (err, result) => {
//                         if (err) {
//                             console.error("Error al insertar el usuario en la tabla usuarios:", err);
//                             return res.status(500).send("Error interno del servidor");
//                         }
//                         res.status(200).send("Cuenta creada exitosamente");
//                     }
//                 );
//             });
//         });
//     });
// });


// app.get('/get-users', async (req, res) => {
//     db.query('SELECT * FROM usuarios',
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send(result)
//             }
//         }
//     )
// })

// app.get('/get-equipos', async (req, res) => {
//     db.query('SELECT * FROM equipos',
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send(result)
//             }
//         }
//     )
// })

// app.get('/get-roles', async (req, res) => {
//     db.query('SELECT * FROM roles',
//         (err, result)=>{
//             if(err){
//                 console.log(err);
//             } else {
//                 res.send(result)
//             }
//         }
//     )
// })

// //LOGIN
// app.post('/check-login', async (req, res) => {
//     const dniCheck = req.body.dni;
//     const passwordCheck = req.body.password;

//     db.query('SELECT * FROM usuarios WHERE dni = ?', [dniCheck], async (err, result) => {
//         if (err) {
//             console.error("Error al buscar el usuario en la base de datos:", err);
//             return res.status(500).send("Error interno del servidor");
//         }

//         if (result.length === 0) {
//             return res.status(400).send({ status: 'Error', message: "DNI o contraseña incorrectos" });
//         }

//         const usuarioRevisar = result[0];

//         try {
//             const loginCorrecto = await bcryptjs.compare(passwordCheck, usuarioRevisar.clave);

//             if (loginCorrecto) {
//                 const token = jsonwebtoken.sign(
//                     { user: usuarioRevisar.dni, role: usuarioRevisar.id_rol },
//                     process.env.JWT_SECRET,
//                     { expiresIn: process.env.JWT_EXPIRATION }
//                 );

//                 const cookieOption = {
//                     expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES) * 24 * 60 * 60 * 1000),
//                     httpOnly: true,
//                     path: "/"
//                 };
//                 res.cookie("jwt", token, cookieOption);
//                 res.send({ status: 'Success', message: "Inicio de sesión exitoso", redirect: "/" });
//             } else {
//                 res.status(400).send({ status: 'Error', message: 'DNI o contraseña incorrectos' });
//             }
//         } catch (error) {
//             console.error('Error durante la comparación de contraseñas:', error);
//             res.status(500).send({ status: 'Error', message: 'Error interno del servidor' });
//         }
//     });
// });


// app.post("/logout", (req, res) => {
//     const jwtCookie = req.cookies.jwt;
//     if (!jwtCookie) {
//         return res.status(401).send("No hay token JWT presente");
//     }

//     res.clearCookie("jwt", { path: "/" });
//     res.send("Sesión cerrada exitosamente");
// });

// app.get("/check-authentication", (req, res) => {
//     try {
//         const jwtCookie = req.cookies.jwt;
//         if (!jwtCookie) {
//             return res.status(401).json({ message: "Usuario no autenticado" });
//         }

//         const decoded = jsonwebtoken.verify(jwtCookie, process.env.JWT_SECRET);
        
//         db.query('SELECT * FROM usuarios WHERE dni = ?', [decoded.user], (err, result) => {
//             if (err || result.length === 0) {
//                 return res.status(401).json({ message: "Usuario no encontrado" });
//             }
//             const usuario = result[0];
//             res.status(200).json({ message: "Usuario autenticado", usuario });
//             // console.log(usuario);
//         });
//     } catch (error) {
//         console.error("Error al verificar la autenticación:", error);
//         res.status(500).json({ message: "Error interno del servidor" });
//     }
// });


// // Ruta temporal para eliminar usuarios
// app.get('/eliminar-usuarios', (req, res) => {
//     const query = 'DELETE FROM usuarios WHERE id_usuario != 0';

//     db.query(query, (err, result) => {
//         if (err) {
//             console.error('Error al eliminar usuarios:', err);
//             return res.status(500).send('Error interno del servidor');
//         }
//         res.send('Usuarios eliminados exitosamente');
//     });
// });

// // RUTAS PROTEGIDAS
// app.get('/', revisarCookie, (req, res) => {
//     console.log('estoy aca');
// });

// app.get('/admin/*', revisarCookie, revisarAdmin, (req, res) => {
//     console.log('Ruta de administrador');
// });

// app.get('/planillero/*', revisarCookie, revisarPlanillero, (req, res) => {
//     console.log('Ruta de planillero');
// });

// // LISTEN
// app.listen(port, () => {
//     console.log(`Corriendo en http://localhost:${port}`);
// })

