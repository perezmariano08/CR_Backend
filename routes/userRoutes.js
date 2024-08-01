const express = require('express');
const userController = require('../controllers/userController');
const equiposController = require('../controllers/equiposController');
const expulsadosController = require('../controllers/expulsadosController');
const partidosController = require('../controllers/partidosController');
const temporadasController = require('../controllers/temporadasController')

const router = express.Router();

router.get('/get-users', userController.getUsers);
router.get('/get-roles', userController.getRoles);
router.get('/get-partidos', userController.getPartidos);
router.get('/get-jugadores', userController.getJugadores);
router.put('/update-partido', userController.updatePartido);


router.get('/get-equipos', equiposController.getEquipos);
router.get('/get-expulsados', expulsadosController.getExpulsados);

router.post('/crear-formaciones', userController.crearFormaciones);
router.post('/crear-goles', userController.crearGoles);
router.post('/crear-asistencias', userController.crearAsistencias);
router.post('/crear-rojas', userController.crearRojas);
router.post('/calcular-expulsiones', expulsadosController.calcularExpulsiones);
router.post('/crear-amarillas', userController.crearAmarillas);
router.put('/update-jugadores', userController.insertarJugadoresEventuales);
router.get('/get-partidos-eventuales', userController.partidosJugadorEventual)

router.get('/get-partidos-incidencias', partidosController.getIncidenciasPartido);
router.get('/get-partidos-formaciones', partidosController.getFormacionesPartido);

router.get('/get-posiciones-temporada', temporadasController.getPosicionesTemporada);

router.get('/get-jugadores-equipo', equiposController.getJugadoresEquipo);



module.exports = router;
