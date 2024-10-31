const express = require('express');
const userController = require('../controllers/userController');
const equiposController = require('../controllers/equiposController');
const expulsadosController = require('../controllers/expulsadosController');
const partidosController = require('../controllers/partidosController');
const temporadasController = require('../controllers/temporadasController')
const jugadoresController = require('../controllers/jugadoresController')
const edicionesController = require('../controllers/edicionesController')
const categoriasController = require('../controllers/categoriasController')
const plantelesController = require('../controllers/plantelesController')
const perfilController = require('../controllers/perfilController');
const zonasController = require('../controllers/zonasController');
const planilleroController = require('../controllers/planilleroController')
const { revisarToken, revisarPlanillero } = require('../middlewares/auth');

const router = express.Router();

router.get('/get-users', userController.getUsers);
router.get('/get-roles', userController.getRoles);
// router.get('/get-partidos', userController.getPartidos);
router.get('/get-jugadores', userController.getJugadores);
router.get('/get-zonas', temporadasController.getZonas);
//router.get('/get-categorias', userController.getCategorias);

// Partido
router.put('/update-partido', revisarToken, revisarPlanillero, userController.updatePartido);
router.put('/suspender-partido', revisarToken, revisarPlanillero, userController.suspenderPartido);
router.post('/crear-formaciones',  revisarToken, revisarPlanillero, userController.crearFormaciones);
router.post('/crear-goles',  revisarToken, revisarPlanillero, userController.crearGoles);
router.post('/crear-asistencias',  revisarToken, revisarPlanillero, userController.crearAsistencias);
router.post('/crear-rojas',  revisarToken, revisarPlanillero, userController.crearRojas);
router.post('/calcular-expulsiones', expulsadosController.calcularExpulsiones);
router.post('/crear-amarillas',  revisarToken, revisarPlanillero, userController.crearAmarillas);
router.put('/update-jugadores',  revisarToken, revisarPlanillero, userController.insertarJugadoresEventuales);
router.post('/crear-jugadores-destacados',  revisarToken, revisarPlanillero, userController.insertarJugadoresDestacados)

router.get('/get-equipos', equiposController.getEquipos);
router.get('/get-expulsados', expulsadosController.getExpulsados);
router.get('/get-partidos-eventuales', userController.partidosJugadorEventual)

router.post('/update-perfil',  revisarToken, revisarPlanillero, perfilController.editarPerfil)

// Gets
router.get('/get-partidos-incidencias', partidosController.getIncidenciasPartido);
router.get('/get-partidos-formaciones', partidosController.getFormacionesPartido);
router.get('/get-posiciones-zona', temporadasController.getPosicionesTemporada);
router.get('/get-estadistica-categoria', temporadasController.getEstadisticasCategoria);
router.get('/get-jugadores-equipo', equiposController.getJugadoresEquipo);
router.get('/get-novedades', perfilController.getNovedades)

//router.post('/crear-jugador', userController.crearJugador);

// Jugadores
router.post('/delete-jugador', jugadoresController.deleteJugador);
router.post('/eliminar-jugador-plantel', jugadoresController.eliminarJugadorPlantel);
router.put('/update-jugador', jugadoresController.updateJugador);
router.post('/importar-jugadores', jugadoresController.importarJugadores);
router.post('/agregar-jugador-plantel', jugadoresController.agregarJugadorPlantel);
router.post('/crear-jugador', jugadoresController.crearJugador);

router.get('/get-jugadores', jugadoresController.getJugadores);
router.get('/verificar-jugador', jugadoresController.verificarJugadorEventual)
router.get('/get-jugador-eventual-categoria', jugadoresController.verificarCategoriaJugadorEventual)

// Planteles
router.get('/get-planteles', plantelesController.getPlanteles);

// Partidos
router.post('/crear-partido', partidosController.crearPartido);
router.post('/importar-partidos', partidosController.importarPartidos);

router.get('/get-partidos', partidosController.getPartidos);
router.get('/get-planteles-partido', partidosController.getPlantelesPartido);
router.put('/actualizar-partido', partidosController.updatePartido);
router.post('/eliminar-partido', partidosController.deletePartido);

// Ediciones
router.post('/crear-edicion', edicionesController.crearEdicion);
router.put('/actualizar-edicion', edicionesController.actualizarEdicion);
router.post('/eliminar-edicion', edicionesController.eliminarEdicion);
router.get('/get-ediciones', edicionesController.getEdiciones);

// Categorias
router.post('/crear-categoria', categoriasController.crearCategoria);
router.put('/actualizar-categoria', categoriasController.actualizarCategoria);
router.post('/eliminar-categoria', categoriasController.eliminarCategoria);

router.get('/get-categorias', categoriasController.getCategorias);

// Equipos
router.post('/crear-equipo', equiposController.crearEquipo);
router.post('/eliminar-equipo', equiposController.eliminarEquipo);
router.put('/actualizar-categoria-equipo', equiposController.actualizarCategoriaEquipo);
router.put('/actualizar-apercibimientos', equiposController.actualizarApercibimientos);

//Temporadas
router.get('/get-temporadas', temporadasController.getTemporadas);
router.post('/insertar-equipo-temporada', temporadasController.InsertarEquipoTemporada);
router.post('/eliminar-equipo-temporada', temporadasController.eliminarEquipoTemporada);

//Zonas 
router.post('/crear-zona', zonasController.crearZona);
router.post('/eliminar-zona', zonasController.eliminarZona);

//DreamTeam
router.get('/get-jugadores-destacados', jugadoresController.getJugadoresDestacados);
router.get('/get-jugadores-categoria', jugadoresController.traerJugadoresPorCategoria);
router.put('/actualizar-jugadores-destacados', jugadoresController.actualizarJugadorDestacado)
router.put('/resetear-jugadores-destacados', jugadoresController.resetearPosicionesYDT)

//Planillero - Web-Socket
router.post('/insertar-accion', revisarToken, revisarPlanillero, planilleroController.insertarAccion)
router.post('/eliminar-accion', revisarToken, revisarPlanillero, planilleroController.eliminarAccion)
router.post('/editar-accion', revisarToken, revisarPlanillero, planilleroController.editarAccion)

router.post('/firma-jugador', revisarToken, revisarPlanillero, planilleroController.firmaJugador)
router.delete('/borrar-firma-jugador', revisarToken, revisarPlanillero, planilleroController.borrarFirmaJugador)

router.get('/verificar-comienzo-partido', revisarToken, revisarPlanillero, planilleroController.verificarJugadores)
router.post('/actualizar-estado-partido', revisarToken, revisarPlanillero, planilleroController.actualizarEstadoPartido)

router.post('/insertar-jugador-destacado', revisarToken, revisarPlanillero, planilleroController.insertarJugadorDestacado)
router.delete('/eliminar-jugador-destacado', revisarToken, revisarPlanillero, planilleroController.eliminarJugadorDestacado)

router.put('/insertar-mvp-partido', revisarToken, revisarPlanillero, planilleroController.updateMvpPartido)

router.post('/insertar-jugador-eventual', revisarToken, revisarPlanillero, planilleroController.crearJugadorEventual)

router.post('/armar-dreamteam', userController.armarDreamteam)

module.exports = router;
