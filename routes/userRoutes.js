const express = require('express');
const userController = require('../controllers/userController');
const equiposController = require('../controllers/equiposController');
const expulsadosController = require('../controllers/expulsadosController');
const partidosController = require('../controllers/partidosController');
const temporadasController = require('../controllers/temporadasController')
const jugadoresController = require('../controllers/jugadoresController')
const edicionesController = require('../controllers/edicionesController')
const categoriasController = require('../controllers/categoriasController')

const router = express.Router();

router.get('/get-users', userController.getUsers);
router.get('/get-roles', userController.getRoles);
// router.get('/get-partidos', userController.getPartidos);
router.get('/get-jugadores', userController.getJugadores);
router.get('/get-zonas', temporadasController.getZonas);
router.get('/get-categorias', userController.getCategorias);

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

router.get('/get-posiciones-zona', temporadasController.getPosicionesTemporada);
router.get('/get-estadistica-categoria', temporadasController.getEstadisticasCategoria);

router.get('/get-jugadores-equipo', equiposController.getJugadoresEquipo);

router.post('/crear-jugador', userController.crearJugador);

// Jugadores
router.get('/get-jugadores', jugadoresController.getJugadores);
router.post('/delete-jugador', jugadoresController.deleteJugador);
router.put('/update-jugador', jugadoresController.updateJugador);
router.post('/importar-jugadores', jugadoresController.importarJugadores);

// Partidos
router.get('/get-partidos', partidosController.getPartidos);
router.post('/crear-partido', partidosController.crearPartido);
router.post('/importar-partidos', partidosController.importarPartidos);
router.get('/get-planteles-partido', partidosController.getPlantelesPartido);

// Ediciones
router.get('/get-ediciones', edicionesController.getEdiciones);
router.post('/crear-edicion', edicionesController.crearEdicion);
router.put('/actualizar-edicion', edicionesController.actualizarEdicion);
router.post('/eliminar-edicion', edicionesController.eliminarEdicion);

// Categorias
router.get('/get-categorias', categoriasController.getCategorias);
router.post('/crear-categoria', categoriasController.crearCategoria);
router.put('/actualizar-categoria', categoriasController.actualizarCategoria);
router.post('/eliminar-categoria', categoriasController.eliminarCategoria);

// Equipos
router.post('/crear-equipo', equiposController.crearEquipo);
router.post('/eliminar-equipo', equiposController.eliminarEquipo);
router.put('/actualizar-categoria-equipo', equiposController.actualizarCategoriaEquipo);

module.exports = router;
