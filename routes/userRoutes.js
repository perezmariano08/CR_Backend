const express = require('express');
const userController = require('../controllers/userController');
const equiposController = require('../controllers/equiposController');
const expulsadosController = require('../controllers/expulsadosController');
const partidosController = require('../controllers/partidosController');
const temporadasController = require('../controllers/temporadasController')
const divisionesController = require('../controllers/divisionesController')
const jugadoresController = require('../controllers/jugadoresController')
const edicionesController = require('../controllers/edicionesController')

const router = express.Router();

router.get('/get-users', userController.getUsers);
router.get('/get-roles', userController.getRoles);
router.get('/get-partidos', userController.getPartidos);
router.get('/get-jugadores', userController.getJugadores);
router.get('/get-temporadas', temporadasController.getTemporadas);

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
router.get('/get-estadistica-temporada', temporadasController.getEstadisticasTemporada);

router.get('/get-jugadores-equipo', equiposController.getJugadoresEquipo);

router.post('/crear-jugador', userController.crearJugador);

// Divisiones
router.post('/crear-division', divisionesController.crearDivision);
router.get('/get-divisiones', divisionesController.getDivisiones);
router.post('/delete-division', divisionesController.deleteDivision);
router.post('/importar-divisiones', divisionesController.importarDivision);

// Divisiones
router.get('/get-jugadores', jugadoresController.getJugadores);
router.post('/delete-jugador', jugadoresController.deleteJugador);
router.put('/update-jugador', jugadoresController.updateJugador);
router.post('/importar-jugadores', jugadoresController.importarJugadores);


router.post('/crear-partido', partidosController.crearPartido);

// Ediciones
router.get('/get-ediciones', edicionesController.getEdiciones);
router.post('/crear-edicion', edicionesController.crearEdicion);

module.exports = router;
